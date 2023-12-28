import Axios from "axios";

export async function axiosPost(apiURL, body, abortController) {
    try {
        const response = await Axios.post(apiURL, { ...body, signal: abortController.signal }).catch((error) => {
            // return backend error
            if (error.response) {
                console.log("response error");
                return error.response;
            } else {
                console.log("no response error");
                throw error;
            }
        });
        console.log(apiURL + " response following:");
        console.log(response.data);
        return response.data;
    } catch (e) {
        console.log(e);
        return e;
    }
}
