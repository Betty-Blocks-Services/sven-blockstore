# HTTPS Status Code Checker - Action step

Sends a HTTP(S) request, identical to the native HTTP(S) step (1.4), but only returns the response status code. The response body is never read.

## Options

### Method, Headers, Protocol, Url, Url Parameters, Query Parameters, Body, Body Parameters

Same as the native HTTP(S) step.

### Response code as

The name of the variable (Number) in which to store the status code of the response, e.g. `200` or `404`.
