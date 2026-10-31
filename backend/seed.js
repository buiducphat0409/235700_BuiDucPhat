require("dotenv").config();
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  deviceType: { type: String, required: true },
  room: { type: String, required: true },
  brand: String,
  model: String,
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Đang sử dụng", "Hư hỏng", "Đang sửa chữa", "Ngừng sử dụng"],
    default: "Đang sử dụng",
  },
  purchaseDate: Date,
  description: String,
});

const Device = mongoose.model("Device", deviceSchema);

const devices = [
  {
    deviceId: "TB001",
    name: "Máy chiếu Epson",
    deviceType: "Máy chiếu",
    room: "A101",
    brand: "Epson",
    model: "EB-X06",
    quantity: 1,
    status: "Đang sử dụng",
    purchaseDate: new Date("2025-01-10"),
    description: "Máy chiếu phục vụ giảng dạy",
  },
  {
    deviceId: "TB002",
    name: "Máy tính Dell",
    deviceType: "Máy tính",
    room: "A102",
    brand: "Dell",
    model: "OptiPlex",
    quantity: 10,
    status: "Đang sử dụng",
    purchaseDate: new Date("2025-02-15"),
    description: "Máy tính phục vụ học tập",
  },
  {
    deviceId: "TB003",
    name: "Loa JBL",
    deviceType: "Thiết bị âm thanh",
    room: "A103",
    brand: "JBL",
    model: "Control 1",
    quantity: 2,
    status: "Đang sửa chữa",
    purchaseDate: new Date("2025-03-20"),
    description: "Thiết bị âm thanh phòng học",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Đã kết nối MongoDB!");

    await Device.deleteMany({
      deviceId: { $in: devices.map((d) => d.deviceId) },
    });

    await Device.insertMany(devices);

    console.log("Đã thêm 3 thiết bị mẫu thành công!");
  } catch (error) {
    console.error("Lỗi:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
