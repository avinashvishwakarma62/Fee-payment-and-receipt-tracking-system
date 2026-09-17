document.addEventListener("DOMContentLoaded",()=>{

    const menuButton =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".sidebar");

    if(menuButton && sidebar){

        menuButton.addEventListener("click",()=>{
            sidebar.classList.toggle("open");
        });
    }

    document.querySelectorAll(
        ".modal-bg"
    ).forEach(modal=>{

        modal.addEventListener("click",(event)=>{

            if(event.target === modal){
                modal.classList.remove("show");
            }

        });

    });

});

function closeModal(id){

    const modal =
        document.getElementById(id);

    if(modal){
        modal.classList.remove("show");
    }
}

function showToast(message){

    let toast =
        document.getElementById("toast");

    if(!toast){

        toast =
            document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },2500);
}

function emptyRow(columns){

    return `
        <tr>
            <td colspan="${columns}"
                style="
                text-align:center;
                padding:35px;
                color:#9298a8;
                ">
                No records found
            </td>
        </tr>
    `;
}