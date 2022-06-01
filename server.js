const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const admindb = require("./server/model/adminModel");
const Swal = require("sweetalert2");
// var $  = require( 'jquery' );
// var dt = require( 'datatables.net' )();
// window.$ = window.jquery = require('./node_modules/jquery');
// window.dt = require('./node_modules/datatables.net')();
// window.$('#table_id').DataTable();

const app = express();

const port = process.env.PORT;

// =================  CLOUD DB =================


mongoose.connect(
`mongodb://${process.env.MONGOURL}`,
  (err) => {
    if (err) {
      console.log("Could not connect to database");
    
      console.log(err.message); 
    } else {
      console.log("MongoDb Connected Successfully.....");
    }
  }
);

// =================  LOCAL DB ================= 

// mongoose.connect('mongodb://localhost:27017/ckart',(err)=>{
//     if(err){
//         console.log("Could not connect to database");
//     }else{
//         console.log('Mongoooooooooooooooo');
//     }
// });
app.use(fileUpload());
// override the method in form
app.use(methodOverride("_method"));

// log requests
app.use(morgan("tiny"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

//static files
app.use("/fonts", express.static(path.join(__dirname, "/public/assets/fonts")));
app.use("/icon", express.static(path.join(__dirname, "/public/assets/icon")));
app.use(
  "/images",
  express.static(path.join(__dirname, "/public/assets/images"))
);
app.use("/css", express.static(path.join(__dirname, "/public/css")));
app.use("/js", express.static(path.join(__dirname, "/public/js")));
app.use(
  "/productsImg",
  express.static(path.join(__dirname, "/public/productsImg")))
app.use(
  "/admin/productsImg",
  express.static(path.join(__dirname, "/public/productsImg"))
);
// app.use(        Folder
//   "/datatables",
//   express.static(path.join(__dirname, "/public/DataTables"))
// );

app.use(function (req, res, next) {
  if (!req.user) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
  }
  next();
});

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/admin", require("./server/routes/router"));
app.use("/", require("./server/routes/userRouter"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
