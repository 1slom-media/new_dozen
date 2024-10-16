import mongoose from "mongoose";
import { MONGO_URI } from "../config/conf";
import { createSmsSettings } from "../modules/shared/utils/createSmsService";
import { ProductModel } from "../modules/product/model/product.model";
import { CategoryModel } from "../modules/category/model/category.model";
console.log(MONGO_URI, "mrr");

export const dbConnection = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(MONGO_URI)
    .then(async (data) => {
      console.log(`MongoDB connected with server: ${data.connection.host}`);
      createSmsSettings();

      const usersCollection = mongoose.connection.db.collection("users");

      // Kolleksiya indekslarini olish
      const indexes = await usersCollection.indexes();
      console.log("Current indexes:", indexes);

      // Indekslar orasida 'username_1' bor yoki yo'qligini tekshirish
      const usernameIndex = indexes.find(
        (index) => index.name === "username_1"
      );

      if (usernameIndex) {
        console.log("username_1 indeksi mavjud, uni o'chiryapman...");
        await usersCollection.dropIndex("username_1");
        console.log("username_1 indeksi o'chirildi.");
      } else {
        console.log("username_1 indeksi topilmadi, o'chirishga hojat yo'q.");
      }
    })
    .catch((err) => {
      console.log(`MongoDB connection error: ${err}`);
    });
};
