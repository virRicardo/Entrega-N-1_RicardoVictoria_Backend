import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";




const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true
    },
    thumbnail: {
      type: String,
      default: ""
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    stock: Number,
    category: {
    type: String,
    index: true
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
