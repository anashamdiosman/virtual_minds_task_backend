class Response {
  sendResponseStatusToUser = (req, res) => {
    const {
      statusCode,
      name,
      body,
      error = null,
      method,
    } = req?.vm?.resBody || {};

    try {
      let resData = {
        status: statusCode,
        error,
        message: this.getResponseMessage({
          status: statusCode,
          name,
          method,
        }),
      };

      resData[name] = body;
      return res.status(statusCode).send(resData);
    } catch (error) {
      return res.status(statusCode).send(error);
    }
  };

  getResponseMessage = ({ status, name, method }) => {
    return (
      fetchAllMessages({ name })[method][status] ||
      "NO RESPONSE BODY WAS PROVIDED"
    );
  };

  prepareResponse = ({ statusCode, name, method, body, error = null }) => {
    return {
      resBody: {
        statusCode,
        name,
        body,
        error: error || null,
        method: method?.toLowerCase(),
      },
    };
  };
}

const fetchAllMessages = ({ name }) => {
  return {
    get: {
      200: `Fetched ${name} successfully`,
      400: `Failed to fetch ${name}`,
      404: `Failed to fetch ${name}, Not found`,
      500: `Internal server error`,
    },
    post: {
      200: `Fetched ${name} successfully`,
      201: `Created ${name} successfully`,
      400: `Failed to fetch or create ${name}`,
      404: `Failed to create ${name}, Not found`,
      500: `Internal server error`,
    },
    put: {
      200: `Updated ${name} successfully`,
      400: `Failed to update ${name}`,
      404: `Failed to update ${name}, Not found`,
      500: `Internal server error`,
    },
    delete: {
      200: `Deleted ${name} successfully`,
      400: `Failed to delete ${name}`,
      404: `Failed to delete ${name}, Not found`,
      500: `Internal server error`,
    },
  };
};
module.exports = Response;
