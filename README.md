# CKart
Shop with peace of mind knowing that you are getting the best price and the best quality laptop.  

[ List of Modules ](https://docs.google.com/document/d/1XcLohw0D8-okjn-MPOjB9RhfV4MGnBRF/edit?usp=sharing&ouid=105530979048078064266&rtpof=true&sd=true)  
[ API Documentation ](https://docs.google.com/document/d/1bKJ6H_tda6s3r-RMW32XtaSY0WscddwQ/edit?usp=sharing&ouid=105530979048078064266&rtpof=true&sd=true)  
[ Figma Prototype ](https://www.figma.com/proto/eZeHmhsr1f7dWO15ugEJor/CKart?node-id=75%3A1309&scaling=scale-down&page-id=0%3A1&starting-point-node-id=75%3A1309&show-proto-sidebar=1)

## Installation

Install [Node](https://nodejs.org/en/)    (  [Documentation](https://medium.com/devops-with-valentine/how-to-install-node-js-and-npm-on-windows-10-windows-11-139442f90f12) )

Use the package manager [npm](https://www.npmjs.com/) to install dependencies.

```bash
npm i
```
Create one file name as ".env" and add the below contents

PORT = 8000                                 //  Port for run the server

TWILIO_ACCOUNT_SID                          //  
TWILIO_AUTH_TOKEN                           //  Twilio for OTP validation these data is taken from our personal twilio account  
TWILIO_SERVICE_SID                          //

MONGOURL= mongodb://localhost:27017/ckart   

RAZORPAY_KEY_ID                             //  Razorpay is for payment integration.  
RAZORPAY_KEY_SECRET                         //  You can get this ID and Secret Key from razorpay account

<img width="308" alt="image" src="https://user-images.githubusercontent.com/99424113/187024620-ec00ef90-0ba9-4ff4-9d1e-dcac85165a18.png">

## Usage

```js

# start the server
npm start

```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
