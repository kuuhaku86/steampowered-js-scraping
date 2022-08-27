const axios = require('axios');
const fastcsv = require("fast-csv");
const fs = require("fs");
var HTMLParser = require('node-html-parser');


async function getData() {
	let start = 0;
	const count = 15;
	const datas = [];

	while (start < 1000) {
		await axios
		.get(`https://store.steampowered.com/contenthub/querypaginated/category/TopRated/render/?query=&start=${start}&count=${count}&cc=ID&l=english&v=4&tag=&category=adventure_rpg`)
		.then((response) => {
			const html = "<div>" + response.data.results_html + "</div>";
			const dom = HTMLParser.parse(html);
			const games = dom.querySelectorAll(".tab_item");

			games.forEach(game => {
				const gameName = game.querySelector(".tab_item_name").textContent.trim();
				const gameLink = game.attributes.href.trim();
				const gameImg = game.querySelector(".tab_item_cap_img").attributes.src.trim();
				let gamePrice = "";
				
				if (game.querySelector(".discount_final_price")) {
					gamePrice = game.querySelector(".discount_final_price").text.trim();
				}

				let tags = game.querySelector(".tab_item_top_tags").childNodes;
				let gameTags = "";

				tags.forEach(tag => {
					gameTags += tag.text;
				});

				datas.push({
					Name: gameName,
					Link: gameLink,
					"Image Link": gameImg,
					Price: gamePrice,
					Tags: gameTags,
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