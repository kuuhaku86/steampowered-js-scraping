const axios = require('axios');
const jsdom = require("jsdom");
const fastcsv = require("fast-csv");
const fs = require("fs");


async function getData() {
	let start = 0;
	const count = 100;
	const datas = [];

	while (start < 1000) {
		await axios
		.get(`https://store.steampowered.com/search/results/?query&start=${start}&count=${count}&dynamic_data=&sort_by=Reviews_DESC&force_infinite=1&tags=21&snr=1_7_7_151_7&infinite=1`)
		.then((response) => {
			const html = "<div>" + response.data.results_html + "</div>";
			const dom = new jsdom.JSDOM(html);
			const games = dom.window.document.querySelectorAll(".search_result_row");

			games.forEach((game) => {
				const gameName = game.querySelector(".title").innerHTML.trim();
				const gameLink = game.href.trim();
				const gameImg = game.querySelector(".search_capsule").querySelector("img").src.trim();
				const gamePrice = game.querySelector(".search_price").innerHTML.trim();
				const gameReview = game.querySelector(".search_review_summary").getAttribute("data-tooltip-html").trim();

				datas.push({
					gameName: gameName,
					gameLink: gameLink,
					gameImg: gameImg,
					gamePrice: gamePrice,
					gameReview: gameReview,
				});
			});

		})
		.catch((error) => {
			console.error(error)
		});

		start += count;
	}

	return datas;
}

function generateCSV(datas) {
	const writeStream = fs.createWriteStream("data.csv");

	fastcsv
		.write(datas, { headers: true })
		.on("finish", function() {
			console.log("Write to CSV successfully!");
		})
		.pipe(writeStream);
}

async function main() {
	const datas = await getData();

	generateCSV(datas);
}

main();