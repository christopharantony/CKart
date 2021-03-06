// function prodetails(image) {
//     console.log(image);
//     $.ajax({
//         url: `/productDetail`,
//         method: "get",
//         data: image,
//         success: (response) => {
//         }
//     })
// }

function addToCart(proId) {
    $.ajax({
        url: `/add-to-cart${proId}`,
        method: "get",
        success: (response) => { 
            if (response.status){
                let count = $('#cart-count').html()
                count = parseInt(count)+1
                $("#cart-count").html(count)
            }
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 800,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })
            Toast.fire({
                icon: 'success',
                title: 'Added to cart'
            })
        },
    });
}

function addToFav(proId) {
    $.ajax({
        url: `/add-to-fav${proId}`,
        method: "post",
        success: (response) => {
            if (response.status) {
                $(`#${proId}`).css('color', 'red')
            } else {
                $(`#${proId}`).css('color', 'wheat')
            }
        }
    })
}

// --------------------------------------------      Offers        ----------------------------------

// function addToCartOff(offId) {
    
//     $.ajax({
//         url: `/add-to-cartOff${offId}`,
//         method: "get",
//         success: (response) => { 
//             if (response.status){
//                 let count = $('#cart-count').html()
//                 count = parseInt(count)+1
//                 $("#cart-count").html(count)
//             }
//             const Toast = Swal.mixin({
//                 toast: true,
//                 position: 'top-end',
//                 showConfirmButton: false,
//                 timer: 800,
//                 timerProgressBar: true,
//                 didOpen: (toast) => {
//                     toast.addEventListener('mouseenter', Swal.stopTimer)
//                     toast.addEventListener('mouseleave', Swal.resumeTimer)
//                 }
//             })
//             Toast.fire({
//                 icon: 'success',
//                 title: 'Added to cart'
//             })
//         },
//     });
// }

function addCartButton(){
    Swal.fire('Please Login')
}