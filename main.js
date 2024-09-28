document.getElementById('resourceForm').onsubmit = function (e) {
    e.preventDefault();

    const processes = parseInt(document.getElementById('processes').value);
    const resources = parseInt(document.getElementById('resources').value);

    if (processes < 1 || processes > 20 || resources < 1 || resources > 20) {
        alert('Please enter valid values for processes (p) and resources (n) (both p and n must be between 1 and 20)');
        return;
    }

    const resultDiv = document.getElementById('resultDiv');
    const resultTable = document.getElementById('resultTable');
    const needMatrixDiv = document.getElementById('needMatrixDiv');
    needMatrixDiv.innerHTML = ''; // Clear previous content.

    // Generate table headers
    let tableContent = '<tr>';
    tableContent += `<th rowspan="2">Process</th>`;

    for (let i = 1; i <= resources; i++) {
        tableContent += `<th colspan="2">Resource ${i}</th>`;
    }

    tableContent += '</tr><tr>';

    for (let i = 1; i <= resources; i++) {
        tableContent += `<th>Allocated</th><th>Max</th>`;
    }
    tableContent += '</tr>';

    resultTable.innerHTML = tableContent;

    // Generate table rows
    for (let i = 0; i < processes; i++) {
        tableContent = `<tr><td>P${i + 1}</td>`;
        for (let j = 0; j < resources; j++) {
            tableContent += `<td><input type="number" id="allocated${i}_${j}" name="allocated${i}_${j}" min="0"></td>`;
            tableContent += `<td><input type="number" id="max${i}_${j}" name="max${i}_${j}" min="0"></td>`;
        }
        tableContent += '</tr>';

        resultTable.innerHTML += tableContent;
    }

    const inputRow = document.createElement('div');
    inputRow.innerHTML = '<h3>Enter the available resources:</h3>';

    // Clear the previous available resources inputs
    const oldInputRow = document.querySelector('#availableResourceRow');
    if (oldInputRow) {
        resultDiv.removeChild(oldInputRow);
    }

    // Create a new input row and set its ID
    inputRow.setAttribute('id', 'availableResourceRow');

    for (let i = 0; i < resources; i++) {
        const label = document.createElement('label');
        label.textContent = ` Resource ${i + 1}\n`;
        inputRow.appendChild(label);

        const input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.setAttribute('id', `available${i}`);
        input.setAttribute('name', `available${i}`);
        input.setAttribute('min', '0');
        inputRow.appendChild(input);
    }

    resultDiv.appendChild(inputRow);

    const submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', 'Submit');
    submitButton.setAttribute('id', 'submitButton');

    resultDiv.appendChild(submitButton);

    resultDiv.style.display = 'block';

    submitButton.addEventListener('click', checkSafeState);

    function checkSafeState() {
        // Get allocated, maximum, and available resources
        const allocated = [];
        const maximum = [];
        const available = [];

        for (let i = 0; i < processes; i++) {
            allocated[i] = [];
            maximum[i] = [];
            for (let j = 0; j < resources; j++) {
                allocated[i][j] = parseInt(document.getElementById(`allocated${i}_${j}`).value);
                maximum[i][j] = parseInt(document.getElementById(`max${i}_${j}`).value);

                // Check if allocated resources are greater than maximum resources
                if (allocated[i][j] > maximum[i][j]) {
                    alert(`Allocated resources for process P${i + 1} and resource ${j + 1} cannot be greater than the maximum resources.`);
                    return;
                }
            }
        }

        for (let i = 0; i < resources; i++) {
            available[i] = parseInt(document.getElementById(`available${i}`).value);

            // Check if available resources are not entered
            if (isNaN(available[i])) {
                alert('Please enter the available resources.');
                return;
            }
        }

        // Calculate need matrix
        const need = [];
        for (let i = 0; i < processes; i++) {
            need[i] = [];
            for (let j = 0; j < resources; j++) {
                need[i][j] = maximum[i][j] - allocated[i][j];
            }
        }

        // Check for safety
        const finish = [];
        const work = [...available];
        for (let i = 0; i < processes; i++) {
            finish[i] = 0;
        }

        let safeSequence = [];
        let count = 0;
        let flag = 0;

        while (count < processes) {
            flag = 0;
            for (let i = 0; i < processes; i++) {
                if (finish[i] === 0) {
                    let j;
                    for (j = 0; j < resources; j++) {
                        if (need[i][j] > work[j]) break;
                    }

                    if (j === resources) {
                        for (let k = 0; k < resources; k++) {
                            work[k] += allocated[i][k];
                        }

                        safeSequence.push(i);
                        finish[i] = 1;
                        flag = 1;
                        break;
                    }
                }
            }

            if (flag === 0) {
                break;
            }

            count++;
        }

        // Display results
        const resultContent = document.createElement('div');

        // Display need matrix
        const needMatrixTable = document.createElement('table');
        let content = '<tr>';
        content += `<th rowspan="2">Process</th>`;

        for (let i = 1; i <= resources; i++) {
            content += `<th>Resource ${i}</th>`;
        }

        content += '</tr><tr>';

        for (let i = 0; i < resources; i++) {
            content += `<th>Need</th>`;
        }
        content += '</tr>';

        for (let i = 0; i < processes; i++) {
            content += `<tr><td>P${i + 1}</td>`;
            for (let j = 0; j < resources; j++) {
                content += `<td>${need[i][j]}</td>`;
            }
            content += '</tr>';
        }

        needMatrixTable.innerHTML = content;
        needMatrixDiv.appendChild(needMatrixTable);

        // Display safe sequence or unsafe state
        if (safeSequence.length === processes) {
            resultContent.innerHTML = `<h3>System is in a safe state.<br>Safe sequence is: ${safeSequence.map(i => `P${i + 1}`).join(', ')}</h3>`;
        } else {
            resultContent.innerHTML = `<h3>System is not in a safe state.<br>Deadlock may occur!</h3>`;
        }

        resultDiv.appendChild(resultContent);
    }
};
