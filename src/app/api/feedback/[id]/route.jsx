import clientPromise from "@/libs/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// =======================================================
// GET - Lấy chi tiết feedback
// =======================================================

export async function GET(request, { params }) {
  try {

    const { id } = await params;


    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success:false,
          message:"ID không hợp lệ"
        },
        {
          status:400
        }
      );
    }


    const client = await clientPromise;
    const db = client.db("Nova-kicks");


    const feedback = await db.collection("feedback")
      .findOne({
        _id:new ObjectId(id)
      });


    if(!feedback){

      return Response.json(
        {
          success:false,
          message:"Không tìm thấy feedback"
        },
        {
          status:404
        }
      );

    }


    return Response.json({
      ...feedback,
      _id:feedback._id.toString()
    });


  }
  catch(error){

    console.error("GET FEEDBACK ERROR:",error);


    return Response.json(
      {
        success:false,
        message:"Lỗi máy chủ"
      },
      {
        status:500
      }
    );

  }

}



// =======================================================
// PATCH - Đổi trạng thái / trả lời feedback
// =======================================================

export async function PATCH(request,{params}) {

  try {


    const {id} = await params;


    if(!ObjectId.isValid(id)){

      return Response.json(
        {
          success:false,
          message:"ID không hợp lệ"
        },
        {
          status:400
        }
      );

    }



    const body = await request.json();



    const client = await clientPromise;
    const db = client.db("Nova-kicks");



    const feedback = await db.collection("feedback")
      .findOne({
        _id:new ObjectId(id)
      });



    if(!feedback){

      return Response.json(
        {
          success:false,
          message:"Không tìm thấy feedback"
        },
        {
          status:404
        }
      );

    }



    // =================================================
    // CHỈ UPDATE TRẠNG THÁI ĐÃ ĐỌC
    // =================================================

    if(body.status){


      await db.collection("feedback")
      .updateOne(

        {
          _id:new ObjectId(id)
        },

        {
          $set:{
            status:body.status
          }
        }

      );



      return Response.json({

        success:true,

        message:"Đã cập nhật trạng thái"

      });


    }




    // =================================================
    // TRẢ LỜI EMAIL
    // =================================================


    if(body.reply){


      const html = `

      <div style="font-family:Arial">


        <h2>Nova Kicks phản hồi liên hệ</h2>


        <p>
        Xin chào <b>${feedback.name}</b>
        </p>


        <p>
        Cảm ơn bạn đã liên hệ Nova Kicks.
        </p>


        <hr/>


        <p>
        <b>Nội dung phản hồi:</b>
        </p>


        <div
        style="
        background:#f5f5f5;
        padding:15px;
        border-radius:8px;
        white-space:pre-line;
        "
        >

        ${body.reply}

        </div>


        <br/>


        <b>
        Nova Kicks Team
        </b>


      </div>

      `;



      await transporter.sendMail({

        from:
        `"Nova Kicks" <${process.env.EMAIL_USER}>`,

        to:
        feedback.email,

        subject:
        `Phản hồi: ${feedback.subject}`,

        html

      });



      await db.collection("feedback")
      .updateOne(

        {
          _id:new ObjectId(id)
        },

        {

          $set:{

            reply:body.reply,

            status:"done",

            repliedAt:new Date()

          }

        }

      );



      return Response.json({

        success:true,

        message:"Đã gửi phản hồi"

      });


    }



    return Response.json({

      success:false,

      message:"Không có dữ liệu cập nhật"

    },{
      status:400
    });



  }
  catch(error){


    console.error("PATCH FEEDBACK ERROR:",error);



    return Response.json(
      {
        success:false,
        message:error.message || "Lỗi máy chủ"
      },
      {
        status:500
      }
    );


  }


}



// =======================================================
// DELETE - Xóa feedback
// =======================================================

export async function DELETE(request,{params}) {

  try {


    const {id}=await params;



    if(!ObjectId.isValid(id)){

      return Response.json(
        {
          success:false,
          message:"ID không hợp lệ"
        },
        {
          status:400
        }
      );

    }



    const client = await clientPromise;

    const db = client.db("Nova-kicks");



    const result =
      await db.collection("feedback")
      .deleteOne({

        _id:new ObjectId(id)

      });



    if(!result.deletedCount){

      return Response.json(
        {
          success:false,
          message:"Không tìm thấy feedback"
        },
        {
          status:404
        }
      );

    }



    return Response.json({

      success:true,

      message:"Đã xóa feedback"

    });



  }
  catch(error){


    console.error("DELETE ERROR:",error);


    return Response.json(
      {
        success:false,
        message:"Lỗi máy chủ"
      },
      {
        status:500
      }
    );

  }

}