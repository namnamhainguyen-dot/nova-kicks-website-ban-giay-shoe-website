import UpdateProductClient from "./UpdateProductClient";

export default async function UpdateProduct({ params }) {
  const { id } = await params;
  return <UpdateProductClient id={id} />;
}

 