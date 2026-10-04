function showHealth(_request, response) {
  return response.status(200).json({
    status: "ok",
    service: "UsiEstoque DDA API",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}

module.exports = { showHealth };
