"use client";

import { useState } from "react";


export default function StaticContactPage() {


  const [loading,setLoading] = useState(false);



  const [formData,setFormData] = useState({

    name:"",
    email:"",
    phone:"",
    subject:"",
    message:""

  });





  const handleSubmit = async(e)=>{


    e.preventDefault();



    if(loading) return;



    setLoading(true);



    try{


      const res = await fetch(
        "/api/feedback",
        {

          method:"POST",

          headers:{

            "Content-Type":"application/json"

          },

          body:JSON.stringify({

            name:formData.name,

            email:formData.email,

            subject:
            formData.subject,

            message:
            formData.message

          })

        }
      );



      const data =
        await res.json();



      console.log(
        "FEEDBACK RESPONSE:",
        data
      );




      if(data.success){



        alert(
          "Cảm ơn bạn đã gửi phản hồi đến Nova Kicks ❤️"
        );



        setFormData({

          name:"",
          email:"",
          phone:"",
          subject:"",
          message:""

        });



      }
      else{


        alert(
          data.message ||
          "Gửi feedback thất bại"
        );


      }



    }
    catch(error){


      console.error(
        "SEND FEEDBACK ERROR:",
        error
      );


      alert(
        "Không thể kết nối máy chủ"
      );


    }
    finally{


      setLoading(false);


    }


  };





  const handleChange=(e)=>{


    setFormData({

      ...formData,

      [e.target.name]:
      e.target.value

    });


  };







  return (

    <div className="container my-5">


      <style jsx global>{`

        .contact-card{

          transition:
          all .3s ease;

        }


        .contact-card:hover{

          transform:
          translateY(-3px);

          box-shadow:
          0 .5rem 1rem rgba(0,0,0,.08)!important;

        }

      `}</style>





      <div className="text-center mb-5">


        <h1
        className="fw-bold text-uppercase"
        style={{
          letterSpacing:"1px"
        }}
        >

          Liên hệ với chúng tôi

        </h1>



        <p className="text-muted">

          Nova Kicks luôn sẵn sàng lắng nghe mọi góp ý và phản hồi từ bạn.

        </p>



        <hr
        className="mx-auto"
        style={{

          width:"60px",

          borderTop:"3px solid #000",

          opacity:1

        }}
        />



      </div>







      <div className="row g-4">



        <div className="col-lg-5">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-3 contact-card bg-light">
            <h4 className="fw-bold text-dark mb-4">Thông Tin Cửa Hàng</h4>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">📍</span>
              <div>
                <h6 className="fw-bold mb-1">Địa chỉ cửa hàng</h6>
                <p className="text-muted mb-0">123 CVPM Quang Trung, Quận 12, TP.HCM</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">📞</span>
              <div>
                <h6 className="fw-bold mb-1">Số điện thoại liên hệ</h6>
                <p className="text-muted mb-0">0123 456 789</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">✉️</span>
              <div>
                <h6 className="fw-bold mb-1">Email hỗ trợ</h6>
                <p className="text-muted mb-0">support@nova-kicks.com</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <span className="fs-3 me-3">⏰</span>
              <div>
                <h6 className="fw-bold mb-1">Thời gian làm việc</h6>
                <p className="text-muted mb-0">09:00 – 22:00 hàng ngày</p>
              </div>
            </div>

            <hr className="text-muted opacity-25 my-3" />

            <h6 className="fw-bold text-dark mb-2">Theo dõi Nova Kicks trên mạng xã hội</h6>
            <div className="d-flex gap-2">
              <span className="badge bg-dark px-3 py-2 rounded cursor-pointer">Facebook</span>
              <span className="badge bg-dark px-3 py-2 rounded cursor-pointer">Instagram</span>
              <span className="badge bg-dark px-3 py-2 rounded cursor-pointer">TikTok</span>
            </div>
          </div>



        </div>








        <div className="col-lg-7">


          <div className="card border-0 shadow-sm p-4 contact-card">


            <h4 className="fw-bold mb-4">

              Gửi lời nhắn

            </h4>





            <form onSubmit={handleSubmit}>


              <div className="row g-3">





                <div className="col-md-6">


                  <label className="form-label">

                    Họ và tên *

                  </label>



                  <input

                    className="form-control"

                    name="name"

                    value={formData.name}

                    onChange={handleChange}

                    required

                  />


                </div>








                <div className="col-md-6">


                  <label className="form-label">

                    Số điện thoại

                  </label>



                  <input

                    className="form-control"

                    name="phone"

                    value={formData.phone}

                    onChange={handleChange}

                  />


                </div>









                <div className="col-12">


                  <label className="form-label">

                    Email *

                  </label>




                  <input

                    type="email"

                    className="form-control"

                    name="email"

                    value={formData.email}

                    onChange={handleChange}

                    required

                  />



                </div>









                <div className="col-12">


                  <label className="form-label">

                    Tiêu đề

                  </label>




                  <input

                    className="form-control"

                    name="subject"

                    value={formData.subject}

                    onChange={handleChange}

                    placeholder="Ví dụ: Góp ý sản phẩm"

                  />


                </div>









                <div className="col-12">


                  <label className="form-label">

                    Nội dung *

                  </label>




                  <textarea

                    rows="5"

                    className="form-control"

                    name="message"

                    value={formData.message}

                    onChange={handleChange}

                    required

                  />



                </div>








                <div className="col-12">


                  <button

                    className="btn btn-dark w-100"

                    disabled={loading}

                  >


                    {
                      loading

                      ?

                      "Đang gửi..."

                      :

                      "🚀 Gửi lời nhắn"

                    }


                  </button>


                </div>




              </div>


            </form>



          </div>



        </div>



      </div>



    </div>

  );


}