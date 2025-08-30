const tf = require("@tensorflow/tfjs-node");

// Generate synthetic data
function generateData(numSamples = 1000) {
  const data = [];
  for (let i = 0; i < numSamples; i++) {
    const age = Math.floor(Math.random() * 70) + 20; // 20-90
    const status = Math.random() < 0.1 ? 1 : 0; // 10% critical
    const gender = Math.random() < 0.5 ? 0 : 1; // 0 female, 1 male

    // Risk logic: 1 if age > 60 or critical status, else 0 (add noise later)
    let risk = age > 60 || status === 1 ? 1 : 0;

    // Add noise ~10%
    if (Math.random() < 0.1) {
      risk = 1 - risk;
    }

    data.push({ age, status, gender, risk });
  }
  return data;
}

// Convert data to tensors
function convertToTensors(data) {
  const inputs = data.map((d) => [d.age, d.status, d.gender]);
  const labels = data.map((d) => d.risk);

  const inputTensor = tf.tensor2d(inputs);
  const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

  return { inputTensor, labelTensor };
}

async function trainModel() {
  const data = generateData();

  const { inputTensor, labelTensor } = convertToTensors(data);

  // Define a simple sequential model
  const model = tf.sequential();
  model.add(
    tf.layers.dense({ inputShape: [3], units: 10, activation: "relu" })
  );
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.logLoss,
    metrics: ["accuracy"],
  });

  // Train the model
  await model.fit(inputTensor, labelTensor, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss=${logs.loss.toFixed(
            4
          )} accuracy=${logs.acc.toFixed(4)}`
        );
      },
    },
  });

  // Save model to disk
  await model.save("file://./risk_model");

  console.log("Model training complete and saved to ./risk_model");
}

trainModel();
