import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class CurrencyconverterServer {

    // Currency rates relative to base INR
    private static final Map<String, Double> rates = new HashMap<>();

    public static void main(String[] args) throws IOException {
        initRates();

        int port = 8000; // http://localhost:8000
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Handle all requests at "/"
        server.createContext("/", new ConverterHandler());

        server.setExecutor(null); // default executor
        server.start();

        System.out.println("Server started on http://localhost:" + port);
    }

    private static void initRates() {
        // Base currency: INR
        rates.put("INR", 1.0);

        // Example approximate rates (not real-time)
        rates.put("USD", 0.012);  // 1 INR = 0.012 USD
        rates.put("EUR", 0.011);  // 1 INR = 0.011 EUR
        rates.put("JPY", 1.78);   // 1 INR = 1.78 JPY
        rates.put("GBP", 0.009);  // 1 INR = 0.009 GBP
    }

    // Handler for HTTP requests
    static class ConverterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod();

            if (!method.equalsIgnoreCase("GET")) {
                // Only allow GET for simplicity
                String response = "Method not allowed";
                exchange.sendResponseHeaders(405, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }

            String query = exchange.getRequestURI().getQuery();
            String page = buildPage(query);

            byte[] responseBytes = page.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, responseBytes.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
        }
    }

    private static String buildPage(String query) {
        String amountStr = "";
        String from = "INR";
        String to = "USD";
        String result = "";

        if (query != null && !query.isEmpty()) {
            Map<String, String> params = parseQuery(query);
            amountStr = params.getOrDefault("amount", "");
            from = params.getOrDefault("from", "INR");
            to = params.getOrDefault("to", "USD");

            if (!amountStr.isEmpty()) {
                try {
                    double amount = Double.parseDouble(amountStr);
                    double converted = convert(amount, from, to);
                    result = String.format("%.2f %s = %.2f %s", amount, from, converted, to);
                } catch (NumberFormatException e) {
                    result = "Invalid amount. Please enter a valid number.";
                }
            } else {
                result = "Please enter an amount.";
            }
        }

        // Simple HTML page
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <title>Currency Converter</title>" +
                "  <style>" +
                "    body { font-family: Arial, sans-serif; background:#f5f5f5; }" +
                "    .container { max-width: 400px; margin: 50px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }" +
                "    h1 { text-align: center; }" +
                "    label { display:block; margin-top:10px; }" +
                "    input, select { width:100%; padding:8px; margin-top:5px; }" +
                "    button { margin-top:15px; width:100%; padding:10px; cursor:pointer; }" +
                "    .result { margin-top:15px; font-weight:bold; text-align:center; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <h1>Currency Converter</h1>" +
                "    <form method='GET' action='/'>" +
                "      <label>Amount:</label>" +
                "      <input type='text' name='amount' value='" + escapeHtml(amountStr) + "' />" +

                "      <label>From:</label>" +
                "      <select name='from'>" +
                buildOption("INR", from) +
                buildOption("USD", from) +
                buildOption("EUR", from) +
                buildOption("JPY", from) +
                buildOption("GBP", from) +
                "      </select>" +

                "      <label>To:</label>" +
                "      <select name='to'>" +
                buildOption("INR", to) +
                buildOption("USD", to) +
                buildOption("EUR", to) +
                buildOption("JPY", to) +
                buildOption("GBP", to) +
                "      </select>" +

                "      <button type='submit'>Convert</button>" +
                "    </form>" +
                "    <div class='result'>" + escapeHtml(result) + "</div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    private static String buildOption(String value, String selectedValue) {
        if (value.equals(selectedValue)) {
            return "<option value='" + value + "' selected>" + value + "</option>";
        } else {
            return "<option value='" + value + "'>" + value + "</option>";
        }
    }

    private static double convert(double amount, String from, String to) {
        // Convert from source to INR
        double inInr = amount / rates.get(from);
        // Convert from INR to target
        return inInr * rates.get(to);
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> params = new HashMap<>();
        try {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] parts = pair.split("=", 2);
                String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
                String value = parts.length > 1
                        ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
                        : "";
                params.put(key, value);
            }
        } catch (Exception e) {
            // ignore parsing errors
        }
        return params;
    }

    private static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
