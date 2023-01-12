const preloader = document.getElementById("preloader");
const errorMsg = document.getElementById("error-msg");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const inputArea = document.getElementById("input-field");
const outputArea = document.getElementById("output-field");
const spanMsg = document.getElementById("border-wrap");
const comparative = {
  data: {
    uuid: "",
    tenantId: "",
    reportType: "",
    type: "",
    images: {
      selfie: "",
      front: "",
      back: "",
    },
    autoClassify: "",
    autoCorrection: "",
    reportId: "",
    templateId: "",
  },
};
let lastClipboardData = "";

// EventListeners
window.addEventListener("mouseover", () => clipboardIsValid());
window.addEventListener("focus", () => clipboardIsValid());
window.addEventListener("load", () => preloader.classList.add("hide"));
inputArea.addEventListener("focus", () => errorMsgBehavior("", "hide"));
inputArea.addEventListener("input", () => {
  spanMsg.classList.remove("active");
  if (inputArea.value.length > 0) {
    btnBehavior(generateBtn, true, "Inverter Selfie");
    return;
  }
  btnBehavior(generateBtn, false, "Inverter Selfie");
});
generateBtn.addEventListener("click", async () => {
  outputArea.value = "";
  btnBehavior(copyBtn, false, "Copiar");
  try {
    const object = await isValidJson(inputArea.value.trim());
    if (object && compareJSON(object, comparative)) {
      invertSelfie(object);
      btnBehavior(copyBtn, true, "Copiar");
      btnBehavior(generateBtn, false, "Selfie Invertida");
      return;
    }
    if (!object) {
      errorMsgBehavior("JSON inválido");
    }
  } catch (err) {
    errorMsgBehavior(`Algum erro ocorreu: ${err}`);
  }
});
copyBtn.addEventListener("click", () => {
  copyContent();
});

// Functions
const invertSelfie = (object) => {
  let frontValue = object.data.images.front;
  let backValue = object.data.images.back;
  object.data.images.back = frontValue;
  object.data.images.front = backValue;
  object.data.autoClassify = false;
  outputArea.value = JSON.stringify(object);
  inputArea.value = "";
};
const copyContent = () => {
  try {
    const generatedJSON = outputArea.value;
    if (generatedJSON) {
      navigator.clipboard.writeText(generatedJSON);
      btnBehavior(copyBtn, false, "Copiado!");
    }
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
const isValidJson = async (object) => {
  try {
    const obj = JSON.parse(object);
    if (typeof obj === "object") {
      return obj;
    }
    return false;
  } catch (_) {
    return false;
  }
};
const compareJSON = (json1, json2) => {
  if (json1.data) {
    const keys1 = Object.keys(json1.data);
    const keys2 = Object.keys(json2.data);

    if (keys1.length !== keys2.length) {
      errorMsgBehavior(
        `JSON com tamanho diferente do padrão, copie novamente na AWS e refaça o processo!`
      );
      return false;
    }

    for (const key of keys1) {
      if (!json2.data.hasOwnProperty(key)) {
        errorMsgBehavior(
          `A propriedade ${key} está diferente do padrão, copie novamente na AWS e refaça o processo!`
        );
        return false;
      }
    }
    for (const key of Object.keys(json1.data.images)) {
      if (!json2.data.images.hasOwnProperty(key)) {
        errorMsgBehavior(
          `A propriedade ${key} está diferente do padrão, copie novamente na AWS e refaça o processo!`
        );
        return false;
      }
    }
    if (json1.data.autoClassify === false) {
      errorMsgBehavior(
        "Confira se esse JSON já não foi invertido anteriormente (Autoclassify já está com o valor de 'false')"
      );
      return false;
    }
    if (json1.data.autoCorrection === true) {
      errorMsgBehavior(
        "A propriedade AutoCorrection está com o valor alterado, copie novamente na AWS e refaça o processo!"
      );
      return false;
    }
    return true;
  }
  errorMsgBehavior(
    "Propriedade fora do parametro ideal da CAF, copie novamente na AWS e refaça o processo"
  );
  return false;
};
const clipboardIsValid = async () => {
  try {
    const clipboardData = await navigator.clipboard.readText();
    const object = await isValidJson(clipboardData);
    if (
      object &&
      object.data &&
      object.data.images &&
      object.data.autoClassify === true &&
      clipboardData !== lastClipboardData &&
      !inputArea.value.length > 0
    ) {
      lastClipboardData = clipboardData;
      activateSpanMsg(clipboardData);
    }
  } catch (err) {
    console.error("Error reading clipboard: ", err);
  }
};
const activateSpanMsg = (data) => {
  const autoPasteLink = document.getElementById("auto-paste");
  spanMsg.classList.add("active");
  setTimeout(() => {
    spanMsg.classList.remove("active");
  }, 10000);
  autoPasteLink.addEventListener("click", () => {
    inputArea.value = data;
    spanMsg.classList.remove("active");
    btnBehavior(generateBtn, true, "Inverter Selfie");
  });
};
const errorMsgBehavior = (msg, hide) => {
  if (!hide) {
    errorMsg.innerHTML = msg;
    errorMsg.classList.add("active");
    errorMsg.classList.remove("disabled");
    inputArea.classList.add("error");
    return;
  }
  errorMsg.classList.remove("active");
  errorMsg.classList.add("disabled");
  inputArea.classList.remove("error");
};
const btnBehavior = (type, turnOn, msg) => {
  if (type === generateBtn) {
    if (turnOn === false) {
      type.innerHTML = msg;
      type.classList.add("waiting");
      type.disabled = true;
    }
    if (turnOn === true) {
      type.innerHTML = msg;
      type.classList.remove("waiting");
      type.disabled = false;
    }
  }
  if (type === copyBtn) {
    if (turnOn === false) {
      type.innerHTML = msg;
      type.classList.add("waiting");
      type.disabled = true;
    }
    if (turnOn === true) {
      type.innerHTML = msg;
      type.classList.remove("waiting");
      type.disabled = false;
    }
  }
};
