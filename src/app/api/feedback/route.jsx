import clientPromise from "@/libs/mongodb";
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({

  service:"gmail",

  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }

});



// ===============================
// GET ALL FEEDBACK
// ===============================

export async function GET(){

  try{

    const client = await clientPromise;

    const db = client.db("Nova-kicks");


    const feedbacks =
      await db
      .collection("feedback")
      .find({})
      .sort({
        createdAt:-1
      })
      .toArray();



    return Response.json(

      feedbacks.map(item=>({

        ...item,

        _id:item._id.toString()

      }))

    );


  }
  catch(error){

    console.error(
      "GET FEEDBACK ERROR:",
      error
    );


    return Response.json(
      {
        success:false,
        message:"Không lấy được feedback"
      },
      {
        status:500
      }
    );

  }

}





// ===============================
// POST CREATE FEEDBACK
// ===============================

export async function POST(request){

  try{


    const body =
      await request.json();



    console.log(
      "NEW FEEDBACK:",
      body
    );



    const {
      name,
      email,
      subject,
      message
    } = body;



    if(
      !name ||
      !email ||
      !message
    ){

      return Response.json(

        {
          success:false,
          message:"Thiếu thông tin bắt buộc"
        },

        {
          status:400
        }

      );

    }



    const client =
      await clientPromise;



    const db =
      client.db("Nova-kicks");



    const feedback={


      name:name.trim(),


      email:email.trim(),


      subject:
      subject?.trim()
      ||
      "Không có tiêu đề",


      message:message.trim(),



      status:"pending",


      reply:"",


      createdAt:new Date()

    };



    const result =
      await db
      .collection("feedback")
      .insertOne(feedback);




    // gửi mail admin

    try{


      await transporter.sendMail({

        from:
        `"Nova Kicks" <${process.env.EMAIL_USER}>`,


        to:
        process.env.EMAIL_USER,


        subject:
        `[Feedback] ${feedback.subject}`,


        html:
        `
        <h3>Feedback mới</h3>

        <p>
        <b>${feedback.name}</b>
        </p>

        <p>
        Email:
        ${feedback.email}
        </p>


        <p>
        ${feedback.message}
        </p>
        `

      });


    }
    catch(error){

      console.log(
        "MAIL ERROR:",
        error
      );

    }




    return Response.json({

      success:true,

      message:"Gửi feedback thành công",

      id:
      result.insertedId.toString()

    });



  }
  catch(error){


    console.error(
      "POST FEEDBACK ERROR:",
      error
    );


    return Response.json(

      {
        success:false,
        message:"Lỗi server"
      },

      {
        status:500
      }
    );
  }
}