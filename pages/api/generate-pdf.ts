import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ message: "HTML content is required" });
    }

    // config puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // aprox. 300dpi
    await page.setViewport({
      width: 650,
      height: 800,
      deviceScaleFactor: 6.125,
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Reset CSS */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              background-color: white;
              color: black;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
            }
            
            /* Container para centralizar a tabela */
            .table-container {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
            }
            
            /* Estilos específicos para a tabela nutricional */
            .nutrition-card {
              width: 300px;
              background-color: white;
              border: 1px solid black;
              box-shadow: none;
              margin: 0 auto;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
            }
            
            th, td {
              border: 1px solid black;
              padding: 2px 4px;
              font-size: 12px;
              text-align: left;
            }
            
            th {
              font-weight: normal;
            }
            
            h3 {
              font-size: 14px;
              text-align: center;
              padding: 4px 0;
              font-weight: bold;
            }
            
            /* Estilo específico para a linha grossa */
            .border-t-3 {
              border-top-width: 3px;
              border-top-style: solid;
              border-top-color: black;
            }
            
            .border-t {
              border-top: 1px solid black;
            }
            
            .border-b {
              border-bottom: 1px solid black;
            }
            
            .border-l {
              border-left: 1px solid black;
            }
            
            .text-center {
              text-align: center;
            }
            
            .text-left {
              text-align: left;
            }
            
            .py-0\\.5 {
              padding-top: 2px;
              padding-bottom: 2px;
            }
            
            .px-2 {
              padding-left: 8px;
              padding-right: 8px;
            }
            
            .px-1 {
              padding-left: 4px;
              padding-right: 4px;
            }
            
            .text-xs {
              font-size: 12px;
            }
            
            .text-\\[9px\\] {
              font-size: 9px;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            .font-normal {
              font-weight: 400;
            }
            
            .whitespace-nowrap {
              white-space: nowrap;
            }
            
            .w-\\[45\\%\\] {
              width: 45%;
            }
            
            .w-\\[18\\%\\] {
              width: 18%;
            }
            
            .w-\\[19\\%\\] {
              width: 19%;
            }
          </style>
        </head>
        <body>
          <div class="table-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const table = document.querySelector("table");
      if (table) {
        const headerRow = table.querySelector("thead tr");
        if (headerRow) {
          headerRow.style.borderTop = "3px solid black";

          const headerCells = headerRow.querySelectorAll("th");
          headerCells.forEach((cell) => {
            cell.style.borderTop = "3px solid black";
            cell.style.borderLeft = "1px solid black";
            cell.style.borderRight = "1px solid black";
            cell.style.borderBottom = "1px solid black";
          });
        }

        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const firstCell = row.querySelector("td:first-child");
          if (firstCell) {
            const text = firstCell.textContent || "";

            // apply indentation based on nutrient type
            if (text.includes("Açúcares totais")) {
              firstCell.style.paddingLeft = "16px"; // Equivalent to pl-4
            } else if (text.includes("Açúcares adicionados")) {
              firstCell.style.paddingLeft = "24px"; // Equivalent to pl-6
            } else if (
              text.includes("Gorduras saturadas") ||
              text.includes("Gorduras trans") ||
              text.includes("Gorduras monoinsaturadas") ||
              text.includes("Gorduras poli-insaturadas")
            ) {
              firstCell.style.paddingLeft = "16px"; // Equivalent to pl-4
            }
          }
        });

        const allCells = table.querySelectorAll("td");
        allCells.forEach((cell) => {
          cell.style.borderWidth = "1px";
        });
      }
    });

    const tableElement = await page.$(".nutrition-card");
    if (!tableElement) {
      throw new Error("Tabela nutricional não encontrada");
    }

    const boundingBox = await tableElement.boundingBox();
    if (!boundingBox) {
      throw new Error("Não foi possível obter as dimensões da tabela");
    }

    console.log("dimensões:", boundingBox);

    // capture screenshot
    const screenshot = await tableElement.screenshot({
      type: "png",
      omitBackground: false,
    });

    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: white;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              width: 100%;
              height: 100%;
            }
            .table-image {
              display: block;
              width: 100%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
          <img src="data:image/png;base64,${screenshot.toString(
            "base64"
          )}" class="table-image" />
        </body>
      </html>
    `;

    const pdfPage = await browser.newPage();
    await pdfPage.setContent(finalHtml, { waitUntil: "networkidle0" });

    const aspectRatio = boundingBox.height / boundingBox.width;
    const pdfWidth = 50; // mm
    const pdfHeight = Math.ceil(pdfWidth * aspectRatio); // dynamic height based on aspect ratio

    console.log(`gerando pdf com ${pdfWidth}x${pdfHeight} de dimensão`);

    // pdf config
    const pdf = await pdfPage.pdf({
      width: `${pdfWidth}mm`,
      height: `${pdfHeight}mm`,
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      scale: 1.0,
    });

    await browser.close();

    // response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=tabela_nutricional.pdf"
    );
    res.setHeader("Content-Length", pdf.length);
    res.status(200).send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      message: "Error generating PDF",
      error: String(error),
      stack: (error as Error).stack,
    });
  }
}
