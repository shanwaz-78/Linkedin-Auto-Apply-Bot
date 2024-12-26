(async function () {
  // Object to store question and answer pairs
  const answerStore = {};

  // Function to simulate click events
  function simulateClick(element) {
    if (element) {
      const event = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    }
  }

  // Delay function to mimic human interaction timing
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Function to scroll into view and highlight an element
  function highlightElement(element) {
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.outline = "2px solid red";
    }
  }

  while (true) {
    // Get all job cards on the page
    const jobCards = document.querySelectorAll(
      ".job-card-container--clickable"
    );

    for (let i = 0; i < jobCards.length; i++) {
      const jobCard = jobCards[i];
      highlightElement(jobCard);
      simulateClick(jobCard);
      await delay(2000); // Wait for job details to load

      // Check for the "Easy Apply" button
      const applyButton = document.querySelector(
        ".jobs-apply-button--top-card button"
      );
      if (applyButton && applyButton.innerText.includes("Easy Apply")) {
        simulateClick(applyButton);
        await delay(2000); // Wait for the application modal to open

        let applicationInProgress = true;
        while (applicationInProgress) {
          // Find all question fields
          const questions = document.querySelectorAll(
            ".jobs-easy-apply-form-section__grouping"
          );

          for (let question of questions) {
            let labelElement = question.querySelector(
              ".fb-dash-form-element__label, .artdeco-text-input--label, legend .fb-dash-form-element__label"
            );
            let questionText = labelElement
              ? labelElement.innerText.trim()
              : "";
            let inputElement;

            // Check for input, textarea, select, or radio buttons
            inputElement = question.querySelector("input, textarea, select");

            if (inputElement && questionText) {
              if (
                inputElement.type === "radio" ||
                inputElement.type === "checkbox"
              ) {
                // Handle radio buttons or checkboxes
                const options = question.querySelectorAll(
                  'input[type="radio"], input[type="checkbox"]'
                );
                if (answerStore[questionText]) {
                  // Select the stored answer
                  const storedValue = answerStore[questionText];
                  const optionToSelect = [...options].find(
                    (option) => option.value === storedValue
                  );
                  if (optionToSelect) {
                    simulateClick(optionToSelect);
                  }
                } else {
                  // Prompt user for new answer
                  highlightElement(question);
                  const optionValues = [...options].map(
                    (option) => option.value
                  );
                  const userAnswer = prompt(
                    `Please select an option for:\n\n${questionText}\nOptions: ${optionValues.join(
                      ", "
                    )}`
                  );
                  if (userAnswer !== null) {
                    answerStore[questionText] = userAnswer;
                    const optionToSelect = [...options].find(
                      (option) => option.value === userAnswer
                    );
                    if (optionToSelect) {
                      simulateClick(optionToSelect);
                    } else {
                      alert(`Invalid option selected: ${userAnswer}`);
                      applicationInProgress = false;
                      break;
                    }
                  } else {
                    alert("Application aborted by user.");
                    applicationInProgress = false;
                    break;
                  }
                }
              } else if (inputElement.tagName.toLowerCase() === "select") {
                // Handle select dropdowns
                const options = [...inputElement.options].map((option) =>
                  option.text.trim()
                );
                if (answerStore[questionText]) {
                  inputElement.value = answerStore[questionText];
                  inputElement.dispatchEvent(
                    new Event("change", { bubbles: true })
                  );
                } else {
                  highlightElement(inputElement);
                  const userAnswer = prompt(
                    `Please select an option for:\n\n${questionText}\nOptions: ${options.join(
                      ", "
                    )}`
                  );
                  if (userAnswer !== null) {
                    answerStore[questionText] = userAnswer;
                    const optionToSelect = [...inputElement.options].find(
                      (option) => option.text.trim() === userAnswer
                    );
                    if (optionToSelect) {
                      inputElement.value = optionToSelect.value;
                      inputElement.dispatchEvent(
                        new Event("change", { bubbles: true })
                      );
                    } else {
                      alert(`Invalid option selected: ${userAnswer}`);
                      applicationInProgress = false;
                      break;
                    }
                  } else {
                    alert("Application aborted by user.");
                    applicationInProgress = false;
                    break;
                  }
                }
              } else {
                // Handle text inputs
                if (answerStore[questionText]) {
                  // Use stored answer
                  inputElement.value = answerStore[questionText];
                  inputElement.dispatchEvent(
                    new Event("input", { bubbles: true })
                  );
                } else {
                  // Prompt user for new answer
                  highlightElement(inputElement);
                  const userAnswer = prompt(
                    `Please answer the following question:\n\n${questionText}`
                  );
                  if (userAnswer !== null) {
                    answerStore[questionText] = userAnswer;
                    inputElement.value = userAnswer;
                    inputElement.dispatchEvent(
                      new Event("input", { bubbles: true })
                    );
                  } else {
                    alert("Application aborted by user.");
                    applicationInProgress = false;
                    break;
                  }
                }
              }
            }
          }

          if (!applicationInProgress) break;

          // Click the "Next", "Review", or "Submit" button
          const nextButton = document.querySelector(
            'button[aria-label^="Continue"], button[aria-label^="Next"], button[aria-label^="Review"], button[aria-label^="Submit"]'
          );
          if (nextButton) {
            simulateClick(nextButton);
            await delay(6000); // Wait for next step to load or submission to complete
          } else {
            applicationInProgress = false;
          }
        }

        // Close the application modal
        const closeButton = document.querySelector(".artdeco-modal__dismiss");
        simulateClick(closeButton);
        await delay(2000);
      }

      // Scroll to the next job card
      if (jobCards[i + 1]) {
        jobCards[i + 1].scrollIntoView({ behavior: "smooth", block: "center" });
        await delay(2000);
      }
    }

    // Refresh the job cards to check for new ones
    window.scrollTo(0, document.body.scrollHeight);
    await delay(5000); // Wait for new job cards to load
    window.scrollTo(0, 0); // Scroll back to top
    await delay(5000); // Wait to stabilize
  }
})();
