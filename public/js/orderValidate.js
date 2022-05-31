

function namevalid(){
    value1 = false;
    if ($("#fname").val().match(/^[A-Za-z][A-Za-z ]*$/)) {
        value1 = true;
        document.getElementById("pname").style.display = "none";
    }
    else {
        document.getElementById("pname").style.display = "block";
        document.getElementById("pname").innerText = "Enter a valid Name";
        value1 = false;
    }
    if ($("#fname").val().length < 3) {

        value2 = false;
        document.getElementById("pname").style.display = "block";
        document.getElementById("pname").innerText = "Minimum Length of this field is 3";

    }
    else {
        value2 = true;
    }
}

function numvalid(){
    value3 = false;
    if ($("#fnum").val().match(/^([+]?\d{1,2}[-\s]?|)\d{3}[-\s]?\d{3}[-\s]?\d{4}$/)) {
        value3 = true;
        document.getElementById("pnum").style.display = "none";
    }else{
        document.getElementById("pnum").style.display = "block";
        document.getElementById("pnum").innerHTML = "Enter a valid number";
        value3 = false;
    }
}

function pinvalid(){
    value4 = false;
    if ($("#fpin").val().match(/\b\d{1,6}\b/)) {
        value4 = true;
        document.getElementById("ppin").style.display = "none";
    }else{
        document.getElementById("ppin").style.display = "block";
        document.getElementById("ppin").innerText = "Enter a valid Pincode";
        value4 = false;
    }
}

function addressvalid(){
    value5 = false;
    if ($("#faddress").val().length > 6){
        value5 = true;
        document.getElementById("paddress").style.display = "none";
    }else{
        document.getElementById("paddress").style.display = "block";
        document.getElementById("paddress").innerText = "Enter a valid Address";
        value5 = false;
    }
}

function couponinput(){
    document.getElementById("pcoupon").style.display = "none";
}

function couponcheck(total,coupon) {
    console.log(`Total : ${total} ::: coupon : ${coupon}`);
    $.ajax({
        url:`/applycoupon/${coupon}/${total}`,
        method: "POST",
        success: (response)=>{
            if (response.error) {
                document.getElementById("pcoupon").style.display = "block";
                document.getElementById("pcoupon").innerText = response.error;
            } else if (response.couponPrice) {
                // document.getElementById("tot").innerText = response.couponPrice;
                $('#tot').val(response.couponPrice);
                $("#apply_btn").hide();
                $("#applied_btn").show();
                // console.log('haiiiiiiiiii');
                // $('#apply_btn').attr('disabled');
                // document.getElementById("apply_btn").innerHTML = "Applied";
                // document.getElementById("apply_btn").disabled = true;
                
                // $('#totalPrice').val(response.couponPrice);
                // document.getElementById("totalPrice").val = response.couponPrice;
                document.getElementById("totalShow").innerText =`Total $ ${response.couponPrice}`;
                document.getElementById("discountPrice").innerText =`Discount : $ ${response.discountPrice}`;
            }else{
                document.getElementById("pcoupon").style.display = "none";
            }
        }
    })
}