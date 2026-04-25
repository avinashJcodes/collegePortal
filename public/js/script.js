// Toggle Password Visibility
function togglePassword(id, iconId) {
    const field = document.getElementById(id);
    const icon = document.getElementById(iconId);
    field.type = field.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye-slash");
    icon.classList.toggle("fa-eye");
}

// Slide Animations
function showRegister() { 
    document.getElementById("formWrapper").classList.add("slide-register"); 
}

function showLogin() { 
    document.getElementById("formWrapper").classList.remove("slide-register"); 
}

// --- OTP Logic ---
const otpPopup = document.getElementById("otpPopup");
const otpCard = document.getElementById("otpCard");

function closeOtpPopup() {
    otpPopup.classList.remove("opacity-100", "pointer-events-auto");
    otpPopup.classList.add("opacity-0", "pointer-events-none");
    otpCard.classList.remove("scale-100");
    otpCard.classList.add("scale-95");
}

function openOtpPopup() {
    const email = sessionStorage.getItem("pendingEmail");

    // 🔥 OTP popup me email show karo
    document.getElementById("otpEmail").innerText = email || "";

    otpPopup.classList.remove("opacity-0", "pointer-events-none");
    otpPopup.classList.add("opacity-100", "pointer-events-auto");
    otpCard.classList.remove("scale-95");
    otpCard.classList.add("scale-100");
}


// Register Form Submit Handler
async function submitRegisterForm() {
    const form = document.querySelector('form[action="/auth/register"]');
    
    // Check HTML5 validation first
    if(!form.checkValidity()) { 
        form.reportValidity(); 
        return; 
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Save email temporarily for OTP verification
    sessionStorage.setItem("pendingEmail", data.email);
    
    const btn = form.querySelector('button[onclick="submitRegisterForm()"]');
    const originalText = btn.innerText;
    btn.innerText = "OTP sending...";
    btn.disabled = true;
    
    try {
        const send = await fetch("/auth/register", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(data) 
        });
        
        const msg = await send.text();
        
        if (msg.includes("OTP sent")) {
            openOtpPopup();
        } else {
            alert(msg);
        }
    } catch(e) { 
        console.error(e);
        alert("Error connecting to server"); 
    } finally { 
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// OTP Input Logic (Auto Focus & Backspace)
const otpInputs = document.querySelectorAll(".otpBox");
otpInputs.forEach((box, i) => {
    box.addEventListener("input", (e) => {
        if (e.target.value.length === 1 && i < otpInputs.length - 1) {
            otpInputs[i + 1].focus();
        }
    });
    box.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && e.target.value === "" && i > 0) {
            otpInputs[i - 1].focus();
        }
    });
});

// Verify OTP Button Click
document.getElementById("verifyBtn").addEventListener("click", async function() {
    let otp = "";
    otpInputs.forEach((b) => otp += b.value);
    
    if (otp.length !== 6) return alert("Enter valid 6-digit OTP");
    
    const email = sessionStorage.getItem("pendingEmail");
    const btn = this;
    const originalText = btn.innerText;
    btn.innerText = "Verifying...";
    
    try {
        const verify = await fetch("/auth/verify-otp", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ email, otp }) 
        });
        
        const msg = await verify.text();
        
       if (msg.includes("OTP Verified")) {

    // OTP popup close
    closeOtpPopup();

    // 🎉 Success popup open
    openRegisterSuccessPopup();

    // optional: clear pending email
    sessionStorage.removeItem("pendingEmail");

} else { 
    alert(msg); 
    btn.innerText = originalText; 
}

    } catch(e) { 
        alert("Verification Error"); 
        btn.innerText = originalText; 
    }
});




// CALL WHEN POPUP SHOWS
startOTPTimer();

function startOTPTimer() {
    let time = 120; // 2 minutes
    const timer = document.getElementById("timer");
    const resendBtn = document.getElementById("resendBtn");

    resendBtn.disabled = true;
    resendBtn.classList.add("cursor-not-allowed", "text-gray-600");
    resendBtn.classList.remove("text-purple-400");

    const countdown = setInterval(() => {
        time--;
        timer.textContent = time;

        if (time <= 0) {
            clearInterval(countdown);
            resendBtn.disabled = false;
            resendBtn.textContent = "Send a new code";
            resendBtn.classList.remove("cursor-not-allowed", "text-gray-600");
            resendBtn.classList.add("text-purple-400", "hover:underline");
        }
    }, 1000);
}

// 🚀 RESEND OTP CLICK EVENT
document.getElementById("resendBtn").addEventListener("click", async () => {
    const btn = document.getElementById("resendBtn");
    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch("/auth/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.text();

        if (result === "OTP Resent") {
            btn.textContent = "Resend code in 120s";
            startOTPTimer();
        } else {
            btn.textContent = "Error! Try again";
            btn.disabled = false;
        }
    } catch (error) {
        btn.textContent = "Failed!";
        btn.disabled = false;
    }
});

// Popup open होताच timer सुरू करा
startOTPTimer();

document.getElementById("forgotBtn").addEventListener("click", () => {
    openForgotPopup();
});




function openForgotPopup() {
    const p = document.getElementById("forgotPopup");
    const c = document.getElementById("forgotCard");

            // 🔥 YAHI LINE ADD KARNI HAI
    document.getElementById("forgotEmail").value = "";
    document.getElementById("forgotMsg").classList.add("hidden");


    p.classList.remove("opacity-0", "pointer-events-none");
    c.classList.remove("scale-90");
    c.classList.add("scale-100");
}

function closeForgotPopup() {
    const p = document.getElementById("forgotPopup");
    const c = document.getElementById("forgotCard");

    c.classList.add("scale-90");
    c.classList.remove("scale-100");

    setTimeout(() => {
        p.classList.add("opacity-0", "pointer-events-none");
    }, 200);
}

document.getElementById("forgotSendBtn").addEventListener("click", async () => {
    const btn = document.getElementById("forgotSendBtn");
    const email = document.getElementById("forgotEmail").value;
    const msg = document.getElementById("forgotMsg");

    if (!email) {
        msg.textContent = "Please enter an email";
        msg.classList.remove("hidden");
        msg.classList.add("text-red-400");
        return;
    }

    // 🔒 Disable button while sending
    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch("/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const result = await response.text();

        // ✅ Backend generic message handle
        if (result.toLowerCase().includes("reset otp")) {

            sessionStorage.setItem("forgotEmail", email);

            msg.textContent = result; // SAME message show
            msg.classList.remove("hidden");
            msg.classList.remove("text-red-400");
            msg.classList.add("text-green-400");

            closeForgotPopup();
            openForgotOtpPopup();
        }

    } catch (err) {
        msg.textContent = "Server error. Try again.";
        msg.classList.remove("hidden");
        msg.classList.add("text-red-400");
    } finally {
        // 🔥 MOST IMPORTANT
        btn.textContent = "Send OTP";
        btn.disabled = false;
    }
});


document.getElementById("forgotOtpVerifyBtn").addEventListener("click", async () => {

    let otp = "";
    document.querySelectorAll(".forgotOtpBox").forEach(box => otp += box.value);

    if (otp.length !== 6) {
        alert("Please enter complete OTP");
        return;
    }

    const res = await fetch("/auth/verify-forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
    });

    const result = await res.text();

    if (result.includes("OTP Verified")) {
    closeForgotOtpPopup();
    openNewPassPopup();
} else {
    alert(result);
}

});



function openForgotOtpPopup() {
    const p = document.getElementById("forgotOtpPopup");
    const c = document.getElementById("forgotOtpCard");



    
    p.classList.remove("opacity-0", "pointer-events-none");
    c.classList.remove("scale-90");
    c.classList.add("scale-100");
    startForgotOtpTimer();

}


function closeForgotOtpPopup() {
    const p = document.getElementById("forgotOtpPopup");
    const c = document.getElementById("forgotOtpCard");

    c.classList.add("scale-90");
    c.classList.remove("scale-100");

    setTimeout(() => {
        p.classList.add("opacity-0", "pointer-events-none");
    }, 200);
}





function openNewPassPopup() {
    const popup = document.getElementById("newPassPopup");
    const card = document.getElementById("newPassCard");

    popup.classList.remove("opacity-0", "pointer-events-none");
    popup.classList.add("opacity-100");

    setTimeout(() => {
        card.classList.remove("scale-90");
        card.classList.add("scale-100");
    }, 50);
}

function closeNewPassPopup() {
    const popup = document.getElementById("newPassPopup");
    const card = document.getElementById("newPassCard");

    card.classList.add("scale-90");
    card.classList.remove("scale-100");

    setTimeout(() => {
        popup.classList.add("opacity-0", "pointer-events-none");
        popup.classList.remove("opacity-100");
    }, 200);
}

document.getElementById("saveNewPassBtn").addEventListener("click", async () => { 
    let pass = document.getElementById("newPass").value;
    let cpass = document.getElementById("confirmPass").value;

    if (!pass || !cpass) return alert("Please enter both fields");
    if (pass !== cpass) return alert("Passwords do not match!");

    const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pass })
    });

    const data = await res.text();

    if (data.includes("successful")) {
        document.getElementById("newPassMsg").classList.remove("hidden");

        setTimeout(() => {
            closeNewPassPopup();
        }, 1200);
    } else {
        alert(data);
    }
});

function openRegisterSuccessPopup() {
    const p = document.getElementById("registerSuccessPopup");
    const c = document.getElementById("registerSuccessCard");

    p.classList.remove("opacity-0", "pointer-events-none");
    c.classList.remove("scale-90");
    c.classList.add("scale-100");
}

function goToLogin() {
    window.location.href = "/";
}


function goToLogin() {
    window.location.href = "/";
}


// 🔥 Register form – Enter = next input
const regInputs = document.querySelectorAll(".regInput");

regInputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            // next input focus
            if (index < regInputs.length - 1) {
                regInputs[index + 1].focus();
            } else {
                // last field → submit form
                submitRegisterForm();
            }
        }
    });
});


function openLoginErrorPopup(message) {

    const popup = document.getElementById("loginErrorPopup");
    const card = document.getElementById("loginErrorCard");

    const msg = document.getElementById("loginErrorMsg");
    const title = document.getElementById("loginErrorTitle");
    const iconBox = document.getElementById("loginErrorIcon");

    // RESET
    iconBox.innerHTML = "";
    iconBox.className =
        "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4";

    // 🟡 PENDING APPROVAL
    if (message.toLowerCase().includes("pending")) {
        title.innerText = "Login Pending";
        msg.innerText = message;

        iconBox.classList.add(
            "bg-yellow-500/20",
            "border",
            "border-yellow-500/30"
        );
        iconBox.innerHTML =
            `<i class="fa-solid fa-clock text-yellow-400 text-2xl"></i>`;
    }

    // 🔴 STUDENT NOT FOUND / WRONG / REJECTED
    else {
        title.innerText = "Something went wrong";
        msg.innerText = message;

        iconBox.classList.add(
            "bg-red-500/20",
            "border",
            "border-red-500/30"
        );
        iconBox.innerHTML =
            `<i class="fa-solid fa-xmark text-red-400 text-2xl"></i>`;
    }

    // SHOW POPUP
    popup.classList.remove("opacity-0", "pointer-events-none");
    card.classList.remove("scale-90");
    card.classList.add("scale-100");
}




function closeLoginErrorPopup() {
    const popup = document.getElementById("loginErrorPopup");
    const card = document.getElementById("loginErrorCard");

    card.classList.add("scale-90");
    card.classList.remove("scale-100");

    setTimeout(() => {
        popup.classList.add("opacity-0", "pointer-events-none");
    }, 200);
}


document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("❌ loginForm not found");
        return;
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // page reload stop

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        try {
            const res = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const msg = await res.text();

           if (
    msg.toLowerCase().includes("dashboard") ||
    msg.toLowerCase().includes("success")
) {
    window.location.href = "/student/dashboard";
} else {
    // 🔥 SHOW ACTUAL BACKEND MESSAGE
    openLoginErrorPopup(msg);
}

        } catch (err) {
            openLoginErrorPopup("Server error. Please try again.");
        }
    });

});


// ================= FORGOT OTP AUTO MOVE =================
const forgotOtpInputs = document.querySelectorAll(".forgotOtpBox");

forgotOtpInputs.forEach((input, index) => {

    // Type karte hi next box
    input.addEventListener("input", (e) => {
        const value = e.target.value;

        // Sirf number allow
        if (!/^[0-9]$/.test(value)) {
            e.target.value = "";
            return;
        }

        // Next input focus
        if (index < forgotOtpInputs.length - 1) {
            forgotOtpInputs[index + 1].focus();
        }
    });

    // Backspace support
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && index > 0) {
            forgotOtpInputs[index - 1].focus();
        }
    });
});


// ================= FORGOT OTP TIMER =================
let forgotOtpInterval = null;

function startForgotOtpTimer() {
    const timer = document.getElementById("forgotOtpTimer");
    const resendBtn = document.getElementById("forgotResendBtn");

    let time = 90; // 1:30 min

    // clear old timer
    if (forgotOtpInterval) clearInterval(forgotOtpInterval);

    // disable resend initially
    resendBtn.disabled = true;
    resendBtn.classList.add("opacity-50", "cursor-not-allowed");
    resendBtn.style.pointerEvents = "none";

    forgotOtpInterval = setInterval(() => {
        const min = String(Math.floor(time / 60)).padStart(2, "0");
        const sec = String(time % 60).padStart(2, "0");

        timer.innerText = `${min}:${sec}`;
        time--;

        if (time < 0) {
            clearInterval(forgotOtpInterval);
            timer.innerText = "00:00";

            // ✅ ENABLE RESEND BUTTON (THIS WAS MISSING)
            resendBtn.disabled = false;
            resendBtn.classList.remove("opacity-50", "cursor-not-allowed");
            resendBtn.style.pointerEvents = "auto";
        }
    }, 1000);
}

/* ================= RESEND OTP (EVENT DELEGATION) ================= */
document.addEventListener("click", async (e) => {

    if (!e.target || e.target.id !== "forgotResendBtn") return;

    const btn = e.target;
    const email = sessionStorage.getItem("forgotEmail"); // ⭐ IMPORTANT

    if (!email) {
        alert("Email not found. Please restart forgot password.");
        return;
    }

    btn.innerText = "Sending...";
    btn.disabled = true;
    btn.style.pointerEvents = "none";

    try {
        const res = await fetch("/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })   // ⭐ SEND EMAIL
        });

        const msg = await res.text();

        if (msg.toLowerCase().includes("otp")) {
            btn.innerText = "Resend OTP";
            startForgotOtpTimer();
        } else {
            btn.innerText = "Resend OTP";
            btn.disabled = false;
            btn.style.pointerEvents = "auto";
        }

    } catch (err) {
        btn.innerText = "Resend OTP";
        btn.disabled = false;
        btn.style.pointerEvents = "auto";
    }
});

  