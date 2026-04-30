let verified = false;

// 🔹 SEND OTP
async function sendOTP() {
  try {
    const phone = document.getElementById("phone").value;

    const res = await fetch("http://localhost:5000/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone })
    });

    const data = await res.json();
    alert(data.message || "OTP sent! Check backend console.");

  } catch (err) {
    alert("Failed to send OTP");
    console.error(err);
  }
}


// 🔹 VERIFY OTP
async function verifyOTP() {
  try {
    const phone = document.getElementById("phone").value;
    const otp = document.getElementById("otp").value;

    const res = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone, otp })
    });

    const data = await res.json();
    verified = data.success;

    alert(verified ? "OTP Verified ✅" : "Wrong OTP ❌");

  } catch (err) {
    alert("Verification error");
    console.error(err);
  }
}


// 🔹 SUBMIT COMPLAINT (FIXED)
async function submitComplaint() {

  if (!verified) {
    alert("Please verify OTP first");
    return;
  }

  try {
    let formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("language", document.getElementById("language").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("description", document.getElementById("description").value);

    const fileInput = document.getElementById("file");
    if (fileInput.files.length > 0) {
      formData.append("file", fileInput.files[0]);
    }

    console.log("Submitting form...");

    const res = await fetch("http://localhost:5000/complaint", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();
    alert(data.message || "Complaint submitted successfully!");

  } catch (err) {
    alert("Complaint submission failed");
    console.error(err);
  }
}