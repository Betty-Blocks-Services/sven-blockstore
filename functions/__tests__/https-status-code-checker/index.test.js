import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import httpsStatusCodeChecker from "../../functions/https-status-code-checker/1.0/index.js";

const headers = [
  { key: "Content-Type", value: "application/json; charset=UTF-8" },
];

describe("httpsStatusCodeChecker", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns only the response code", async () => {
    const out = await httpsStatusCodeChecker({
      url: "example.com",
      method: "get",
      body: "",
      headers,
      protocol: "http",
      queryParameters: [{ key: "name", value: "foo" }],
    });

    expect(out).toEqual({ responseCode: 200 });
    expect(fetchMock).toHaveBeenCalledWith("http://example.com?name=foo", {
      method: "get",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    });
  });

  it("trims the protocol off and parses url parameters", async () => {
    await httpsStatusCodeChecker({
      url: "https://test.test/{{id}}",
      method: "get",
      protocol: "https",
      urlParameters: [{ key: "id", value: "101" }],
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://test.test/101");
  });

  it("parses the body parameters and sends the body", async () => {
    await httpsStatusCodeChecker({
      url: "test.test/body",
      method: "post",
      body: "Hello {{name}}",
      protocol: "https",
      bodyParameters: [{ key: "name", value: "foo" }],
    });

    expect(fetchMock.mock.calls[0][1].body).toBe("Hello foo");
  });

  it("returns non-2xx status codes instead of throwing", async () => {
    fetchMock.mockResolvedValue({ status: 404 });

    const out = await httpsStatusCodeChecker({
      url: "example.com/missing",
      method: "get",
      protocol: "https",
    });

    expect(out).toEqual({ responseCode: 404 });
  });

  it("throws when fetch throws", async () => {
    fetchMock.mockRejectedValue(new Error("Something went wrong."));

    await expect(
      httpsStatusCodeChecker({
        url: "error.com",
        method: "get",
        protocol: "http",
      }),
    ).rejects.toThrow("Something went wrong.");
  });
});
