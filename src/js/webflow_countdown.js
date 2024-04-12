  // Countdown Timer by Flowbase
  // Set the target date and time
  var early_bird_date = new Date("October 16, 2023 23:59:59").getTime();
  var abstract_date = new Date("October 16, 2023 23:59:59").getTime();
  
  setInterval(setCountdown(early_bird_date, "earlybird"), 1000);
  setInterval(setCountdown(abstract_date, "abstract"), 1000);

  function setCountdown(target_date, id) {
    // Get the current date and time
    var current_date = new Date().getTime();

    // Calculate the remaining time in milliseconds
    var distance = target_date - current_date;

    // Calculate the remaining days, hours, minutes, and seconds
    var day = 1000 * 60 * 60 * 24;
    var hour = 1000 * 60 * 60;
    var minute = 1000 * 60;
    var second = 1000;

    // Add the ID to your HTML/Webflow text elements
    document.getElementById(`${id}_days`).innerText = Math.floor(distance / (day));
    document.getElementById(`${id}_hours`).innerText = Math.floor((distance % (day)) / (hour));
    document.getElementById(`${id}_minutes`).innerText = Math.floor((distance % (hour)) / (minute));
    document.getElementById(`${id}_seconds`).innerText = Math.floor((distance % (minute)) / second);

    // Check if the countdown is complete
    if (distance < 0) {
      clearInterval(countdown_timer);
      document.getElementById(`${id}_days`).innerText = '0';
      document.getElementById(`${id}_hours`).innerText = '0';
      document.getElementById(`${id}_minutes`).innerText = '0';
      document.getElementById(`${id}_seconds`).innerText = '0';
      // You can display an element at the end of the countdown with this ID  
      document.getElementById('message').style.display = 'block';
    }

  }
