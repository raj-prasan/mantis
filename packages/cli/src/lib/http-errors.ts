type ErrorResponse = {
  json: ()=> Promise<unknown>;
  status : number;
  statusText : string
};

export async function getErrorMessage(response: ErrorResponse){
  try {
    const data = (await response.json()) as {error? : string}

    if(typeof data.error === "string" && data.error.length > 0){
      return data.error
    }
  } catch (error) {
    // Ignore invalid error Payloads
  }

  return response.statusText || `Request Failed with status code ${response.status}`;
}