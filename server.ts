import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const rootDir = process.cwd();

  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Serve static assets with explicit MIME types before Vite middleware
  app.use(
    "/css",
    express.static(path.join(rootDir, "css"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=UTF-8");
        }
      },
    })
  );

  app.use(
    "/js",
    express.static(path.join(rootDir, "js"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
        }
      },
    })
  );

  app.use("/articles", express.static(path.join(rootDir, "articles")));

  // Static site pages
  app.get("/", (req, res) => {
    res.sendFile(path.join(rootDir, "index.html"));
  });

  app.get("/index.html", (req, res) => {
    res.sendFile(path.join(rootDir, "index.html"));
  });

  app.get(["/about", "/about.html"], (req, res) => {
    res.sendFile(path.join(rootDir, "about.html"));
  });

  app.get(["/contact", "/contact.html"], (req, res) => {
    res.sendFile(path.join(rootDir, "contact.html"));
  });

  app.get(["/privacy-policy", "/privacy-policy.html"], (req, res) => {
    res.sendFile(path.join(rootDir, "privacy-policy.html"));
  });

  app.get(["/terms", "/terms.html"], (req, res) => {
    res.sendFile(path.join(rootDir, "terms.html"));
  });

  app.get(["/disclaimer", "/disclaimer.html"], (req, res) => {
    res.sendFile(path.join(rootDir, "disclaimer.html"));
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml").sendFile(path.join(rootDir, "sitemap.xml"));
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").sendFile(path.join(rootDir, "robots.txt"));
  });

  app.get("/ads.txt", (req, res) => {
    res.type("text/plain").sendFile(path.join(rootDir, "ads.txt"));
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(rootDir, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
