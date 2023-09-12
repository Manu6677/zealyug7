require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

// Mongo connection
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("database Connected");
}

//User schema
const userSchema = mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  confirmPassword: { type: String },
});

const userCredentials = mongoose.model("userCredentials", userSchema);

// Api connection
app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const exists = await userCredentials.findOne({ useremail: req.body.email });
    if (exists) {
      res.status.json({ message: "Email already in use", alert: false });
    } else {
      const data = await userCredentials.create({
        email,
        password,
      });
      res.status(200).json({ data, alert: true });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Mailer
app.post("/getbill", async (req, res) => {
  console.log("inside bill", req.body);
  const { email } = req.body;

  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };
  let transporter = nodemailer.createTransport(config);
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/",
    },
  });
  //email now
  let response = {
    body: {
      name: "Our newsletter is your gateway to:",

      intro: [
        "Exclusive Content: Get access to insightful articles, tips, and resources.",
        "SpecialOffers: Be the first to know about promotions, discounts, and giveaways. upcomming",
        "Events: Discover the latest enhancements to our products and services.",
        "Community Insights: Hear stories and insights from our community of user.",
        "Rest assured, your email address will be kept confidentail and will only be used to send your news letter. we value privacy and adhere to strict data protecttion guidelines.",
        "Thankyou for considering to our newsletter. we look forward to sharing valuable content and keeping updated.",
        "If you have any question or need further assistance, please feel free to contact our support team at zealyug@gmail.com.",
      ],
      outro: ["Best regards", "Manu Abhishek", "manu.panjoria666@gmail.com"],
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.EMAIL,
    to: email,
    subject: "Place Order",
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json({
        msg: "You should receive an email",
        alert: true,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });

  //   res.status(200).json("bills");
});

app.listen(PORT, () => {
  console.log("Server is running");
});
