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
let newJson = {};
let lastClipboardData = "";

// EventListeners
window.addEventListener("focus", () => {
  clipboardIsValid(true);
});
window.addEventListener("load", () => {
  preloader.classList.add("hide");
});
inputArea.addEventListener("input", (key) => {
  spanMsg.classList.remove("active");
  if (inputArea.value.length > 0) {
    btnBehavior(generateBtn, true, "Inverter Selfie");
    return;
  }
  btnBehavior(generateBtn, false, "Inverter Selfie");
});
inputArea.addEventListener("focus", () => {
  errorMsgBehavior("", "hide");
});
generateBtn.addEventListener("click", () => {
  outputArea.value = "";
  btnBehavior(copyBtn, false, "Copiar");
  isValidJson(inputArea.value.trim()).then((object) => {
    if (object != false) {
      if (compareJSON(object, comparative)) {
        invertSelfie(object).then((_) => {
          btnBehavior(generateBtn, false, "Inverter Selfie");
          btnBehavior(copyBtn, true, "Copiar");
        });
      }
      return;
    }
    errorMsgBehavior(`JSON inválido!`);
  });
});
copyBtn.addEventListener("click", async () => {
  try {
    if (!outputArea.value.length) {
      return;
    }
    await copyContent();
    btnBehavior(copyBtn, false, "Copiado!");
  } catch (error) {
    alert(error.message);
  }
});

// Functions
const invertSelfie = async (object) => {
  let dataFront = object.data.images.front;
  let dataBack = object.data.images.back;
  object.data.autoClassify = false;
  object.data.images.back = dataFront;
  object.data.images.front = dataBack;
  newJson = JSON.stringify(object);
  outputArea.value = newJson;
  inputArea.value = "";
};
const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(newJson);
    console.log("Copiado para o clipboard");
  } catch (err) {
    errorMsgBehavior("Algum erro ocorreu");
  }
};
const isValidJson = async (object) => {
  try {
    const obj = JSON.parse(object);
    return obj;
  } catch (_) {
    return false;
  }
};
const compareJSON = (json1, json2) => {
  if (json1.data && json2.data) {
    const keys1 = Object.keys(json1.data);
    const keys2 = Object.keys(json2.data);

    if (keys1.length !== keys2.length) {
      errorMsgBehavior(`JSON inválido!`);
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
    if (!object) {
      return;
    }
    if (
      object.data &&
      object.data.images &&
      object.data.autoClassify === true &&
      clipboardData !== lastClipboardData &&
      !inputArea.value.length > 0
    ) {
      try {
        lastClipboardData = clipboardData;
        activateSpanMsg(clipboardData);
      } catch (e) {
        console.error("Error activateSpanMsg: ", e);
      }
    }
  } catch (error) {
    console.error("Error reading clipboard: ", error);
  }
};
const activateSpanMsg = (data) => {
  const autoPasteLink = document.getElementById("auto-paste");
  spanMsg.classList.add("active");
  setTimeout(() => {
    spanMsg.classList.remove("active");
    console.log("desativando spanMsg");
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
