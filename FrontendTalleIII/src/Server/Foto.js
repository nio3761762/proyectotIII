import API from './api';

export const SubirFoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("imagen", file);

    const response = await API.post("upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data?.url) {
      throw new Error("La respuesta no contiene la URL de la imagen");
    }

    return response.data.url;
  } catch (error) {
    console.error("Error al subir la imagen:", error);

    // Manejo seguro del error
    let mensaje = "No se pudo subir la imagen";
    if (error.response?.data?.error) {
      mensaje = error.response.data.error;
    } else if (error.message) {
      mensaje = error.message;
    }

    throw new Error(mensaje); // ahora `error.message` siempre estará definido
  }
};

export const SubirArchivo = async (file) => {
  try {
    const formData = new FormData();
    formData.append("archivo", file)

    const response = await API.post("upload-Archivo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data?.url) {
      throw new Error("La respuesta no contiene la URL de la imagen");
    }

    return response.data.url;
  } catch (error) {
    console.error("Error al subir el archibo:", error);

    // Manejo seguro del error
    let mensaje = "No se pudo subir la imagen";
    if (error.response?.data?.error) {
      mensaje = error.response.data.error;
    } else if (error.message) {
      mensaje = error.message;
    }

    throw new Error(mensaje); // ahora `error.message` siempre estará definido
  }
};