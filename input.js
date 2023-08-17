let chunks = [];
let mediaRecorder;

let startButton = document.getElementById("start");
let stopButton = document.getElementById("stop");

// Initial state
stopButton.style.backgroundColor = "#2b2b3a"; // Gray color
stopButton.disabled = true;

startButton.addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorder.start();

    startButton.style.backgroundColor = "#2b2b3a"; // Gray color
    startButton.disabled = true;

    stopButton.style.backgroundColor = "#1ed2f4"; // Main color
    stopButton.disabled = false;

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = (e) => {
      let blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];
      let audioURL = URL.createObjectURL(blob);
      document.getElementById("audio").src = audioURL;

      // Create a new FormData object.
      var formData = new FormData();

      // Create a blob file object from the blob.
      var file = new File([blob], "user_audio.webm", {
        type: "audio/webm",
      });

      // Append the audio file to the form data.
      formData.append("audio", file);

      console.log("Sending audio file to server...");

      // Send speech data to Whisper Speech-to-Text API
      // Send the audio file to your server.
      async function send_whisper_data(formData) {
        try {
          const response = await fetch("whisper_send_data.php", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const whisper_received_data = await response.json();
          document.getElementById("whisper_response_display_area").textContent =
            whisper_received_data.text;

          console.log("Response from server:", whisper_received_data);

          await send_transcript_analysis(whisper_received_data.text);
        } catch (error) {
          console.error("Error sending whisper data to server:", error);
        }
      }

      // Send Transcript to get analyzed
      async function send_transcript_analysis(text) {
        try {
          const response = await fetch("transcript_analysis.php", {
            method: "POST",
            body: text,
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const transcript_received_data = await response.json();
          document.getElementById(
            "transcript_analysis_response_display_area"
          ).textContent = JSON.stringify(transcript_received_data, null, 2);

          console.log("Response from server 2:", transcript_received_data);

          generate_url(transcript_received_data);
        } catch (error) {
          console.error("Error sending transcript analysis to server:", error);
        }
      }

      // Generate URL Function
      const generate_url = (transcript_received_data) => {
        console.log(transcript_received_data);
        const base_url = "https://interactiveutopia.com/";
        const type_url = {
          appointment: "appointments.php",
          report: "reports.php",
          noc: "appointments.php",
          user: "users.php",
          contact: "contact-us.php",
        };

        const actions = {
          create: "new",
          edit: "modify",
        };

        // Destructuring
        const {
          type = "",
          action = "",
          first_name = "",
          last_name = "",
          email = "",
          phone_number = "",
          fax = "",
          address = "",
          city = "",
          state = "",
          zip_code = "",
        } = transcript_received_data;

        // Error Check
        if (!type_url[type]) {
          console.error("Unknown type:", type);
          return;
        }
        if (!actions[action]) {
          console.error("Unknown action:", action);
          return;
        }

        // Put URL Together
        let url =
          base_url +
          type_url[type] +
          "?" +
          "action=" +
          encodeURIComponent(actions[action]);

        // Available parameters that are available to send
        const received_parameters = {
          first_name,
          last_name,
          email,
          phone_number,
          fax,
          address,
          city,
          state,
          zip_code,
        };

        // Add parameters to URL, if value is not empty
        Object.entries(received_parameters).forEach(([key, value]) => {
          if (value !== "") {
            url += `&${key}=${encodeURIComponent(value)}`;
          }
        });

        // Log and print generated URL
        console.log(url);
        document.getElementById("url_response_display_area").innerHTML =
          '<a href="' + url + '" target="_blank">Test Generated URL</a>';
      };

      // Send speech data to Whisper Speech-to-Text API
      send_whisper_data(formData);
    };

    console.log("Recording started...");
  });
});

// Stop button event listener
stopButton.addEventListener("click", () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
  console.log("Recording stopped...");

  stopButton.style.backgroundColor = "#2b2b3a"; // Gray color
  stopButton.disabled = true;

  startButton.style.backgroundColor = "#1ed2f4"; // Main color
  startButton.disabled = false;
});
