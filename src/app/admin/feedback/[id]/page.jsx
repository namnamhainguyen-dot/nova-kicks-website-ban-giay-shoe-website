"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";


export default function FeedbackDetailPage() {

  const { id } = useParams();

  const router = useRouter();


  const [feedback, setFeedback] = useState(null);

  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);



  // ==============================
  // GET DETAIL
  // ==============================

  useEffect(() => {

    if(id){
      fetchFeedback();
    }

  },[id]);




  const fetchFeedback = async()=>{

    try{

      setLoading(true);


      const res = await fetch(
        `/api/feedback/${id}`,
        {
          cache:"no-store"
        }
      );


      const data = await res.json();



      if(res.ok){

        setFeedback(data);

        setReply(
          data.reply || ""
        );

      }
      else{

        alert(
          data.message
        );

      }


    }
    catch(error){

      console.error(error);

      alert(
        "Không thể tải feedback"
      );

    }
    finally{

      setLoading(false);

    }

  };





  // ==============================
  // SEND REPLY EMAIL
  // ==============================


  const handleReply = async()=>{


    if(!reply.trim()){

      return alert(
        "Vui lòng nhập nội dung phản hồi."
      );

    }



    try{

      setSending(true);



      const res = await fetch(
        `/api/feedback/${id}`,
        {

          method:"PATCH",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            reply,

            status:"done"

          })

        }
      );



      const data = await res.json();



      if(res.ok){

        alert(
          "Đã gửi phản hồi cho khách hàng."
        );


        fetchFeedback();

      }
      else{

        alert(
          data.message
        );

      }



    }
    catch(error){

      console.error(error);

      alert(
        "Không thể gửi phản hồi."
      );

    }
    finally{

      setSending(false);

    }


  };





  // ==============================
  // MARK DONE
  // ==============================


  const handleDone = async()=>{


    try{


      const res = await fetch(
        `/api/feedback/${id}`,
        {

          method:"PATCH",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            status:"done"

          })

        }
      );



      const data =
      await res.json();



      if(res.ok){

        fetchFeedback();

      }
      else{

        alert(data.message);

      }


    }
    catch(error){

      console.error(error);

      alert(
        "Không thể cập nhật."
      );

    }


  };





  // ==============================
  // DELETE
  // ==============================


  const handleDelete = async()=>{


    if(
      !confirm(
        "Bạn có chắc muốn xóa feedback này?"
      )
    )
    return;



    try{


      const res = await fetch(
        `/api/feedback/${id}`,
        {

          method:"DELETE"

        }
      );



      const data =
      await res.json();



      if(res.ok){

        alert(
          "Đã xóa feedback."
        );


        router.push(
          "/feedback"
        );

      }
      else{

        alert(
          data.message
        );

      }


    }
    catch(error){

      console.error(error);

      alert(
        "Không thể xóa."
      );

    }


  };





  if(loading){

    return (

      <div className="container py-5 text-center">

        <div className="spinner-border"></div>

      </div>

    );

  }





  if(!feedback){

    return (

      <div className="container py-5 text-center">

        Không tìm thấy feedback.

      </div>

    );

  }





  return (

    <div
      className="container py-4"
      style={{
        maxWidth:"900px"
      }}
    >


      <div className="d-flex justify-content-between align-items-center mb-4">


        <div>

          <h3 className="fw-bold">

            📩 Chi tiết Feedback

          </h3>


          <p className="text-secondary">

            Xem và phản hồi khách hàng

          </p>


        </div>




        <Link
          href="/feedback"
          className="btn btn-outline-secondary"
        >

          Quay lại

        </Link>


      </div>






      <div className="card shadow-sm border-0 rounded-4">


        <div className="card-body">





          <div className="row mb-3">


            <div className="col-md-6">


              <label className="form-label fw-semibold">

                Họ tên

              </label>


              <input

                className="form-control"

                value={feedback.name}

                disabled

              />


            </div>




            <div className="col-md-6">


              <label className="form-label fw-semibold">

                Email

              </label>


              <input

                className="form-control"

                value={feedback.email}

                disabled

              />


            </div>


          </div>






          <div className="mb-3">


            <label className="form-label fw-semibold">

              Chủ đề

            </label>



            <input

              className="form-control"

              value={feedback.subject}

              disabled

            />


          </div>







          <div className="mb-3">


            <label className="form-label fw-semibold">

              Nội dung

            </label>



            <textarea

              className="form-control"

              rows={6}

              value={feedback.message}

              disabled

            />


          </div>







          <div className="mb-3">


            <label className="form-label fw-semibold">

              Ngày gửi

            </label>


            <input

              className="form-control"

              disabled

              value={
                new Date(
                  feedback.createdAt
                )
                .toLocaleString(
                  "vi-VN"
                )
              }

            />


          </div>







          <div className="mb-4">


            <label className="form-label fw-semibold">

              Trạng thái

            </label>



            <div>


            {
              feedback.status==="done"

              ?

              <span className="badge bg-success">

                Đã xử lý

              </span>


              :

              <span className="badge bg-warning text-dark">

                Chưa xử lý

              </span>

            }


            </div>


          </div>







          <hr />







          <div className="mb-4">


            <label className="form-label fw-semibold">

              Phản hồi khách hàng

            </label>



            <textarea

              className="form-control"

              rows={7}

              placeholder="Nhập nội dung trả lời..."

              value={reply}

              onChange={
                e=>setReply(e.target.value)
              }

            />


          </div>








          <div className="d-flex justify-content-end gap-2">



            {
              feedback.status !== "done"

              &&

              <button

                className="btn btn-success"

                onClick={handleDone}

              >

                ✓ Đánh dấu đã xử lý

              </button>

            }






            <button

              className="btn btn-primary"

              disabled={sending}

              onClick={handleReply}

            >

              {
                sending

                ?

                "Đang gửi..."

                :

                "✉ Gửi phản hồi"

              }


            </button>







            <button

              className="btn btn-danger"

              onClick={handleDelete}

            >

              🗑 Xóa

            </button>





          </div>





        </div>


      </div>



    </div>

  );

}