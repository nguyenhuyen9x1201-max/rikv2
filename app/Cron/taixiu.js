// (giữ nguyên header của bạn)
let Helpers     = require('../Helpers/Helpers');
let UserInfo    = require('../Models/UserInfo');
let TXPhien     = require('../Models/TaiXiu_phien');
let TXCuoc      = require('../Models/TaiXiu_cuoc');
let TaiXiu_User = require('../Models/TaiXiu_user');
let TXCuocOne   = require('../Models/TaiXiu_one');
let TopVip      = require('../Models/VipPoint/TopVip');
let TXBotChat = require('../Models/TaiXiu_bot_chat');

let HU_game    = require('../Models/HU');
let bot        = require('./taixiu/bot');
let botList    = [];
let botListChat    = [];
let botHu      = require('./bot_hu');
let botTemp    = [];
let io         = null;
let botCuoc = 200;
let gameLoop   = null;
let _tops = [];

function getIndex(arr,name){
	for(let i=0; i< arr.length ;i++){
		if(arr[i]['name'] == name){
			return i+1;
		}
	}
	return 0;
}

let topUser = function(){
	TaiXiu_User.find({'totall':{$gt:0}}, 'totall uid', {sort:{totall:-1}, limit:10}, function(err, results) {
		Promise.all(results.map(function(obj){
			return new Promise(function(resolve, reject) {
				UserInfo.findOne({'id': obj.uid}, function(error, result2){
					resolve({name:!!result2 ? result2.name : ''});
				})
			})
		}))
		.then(function(result){
			 _tops = result;
			 if (io) io.top = _tops;
			 
		});
	});
}

let botchatRun = function(){
	let time = 0;
	let timeChat = 0;
	
	let botChat = setInterval(function(){
		let _time = 20000 * parseFloat((Math.random() * (0.9 - 0.3) + 0.5).toFixed(4));
		if(time == 0 || (Date.now() - time) >= _time){
			Helpers.shuffle(botListChat);
			if(botListChat.length > 1){
				TXBotChat.aggregate([{ $sample: { size: 1 } }]).exec(function(err, chatText){
					Helpers.shuffle(chatText);
					Object.values(io.users).forEach(function(users){
						users.forEach(function(client){
							var content = { taixiu: { chat: { message: { user: botListChat[0].name, value: chatText[0].Content ,top:getIndex(_tops,botListChat[0].name)} } } };
							client.red(content);
						});
					});
				});
			}
			time = Date.now();
		}
	},500);
	
	return botChat;
};

let init = function(obj){
	io = obj;
	io.listBot = [];
	UserInfo.find({type:true}, 'id name', function(err, list){
		if (!!list && list.length) {
			io.listBot = list.map(function(user){
				user = user._doc;
				delete user._id;
				return user;
			});
			list = null;
		}
	});

	io.taixiu = {
		taixiu: {
			red_player_tai: 0,
			red_player_xiu: 0,
			red_tai: 0,
			red_xiu: 0,
		}
	};

	io.taixiuAdmin = {
		taixiu: {
			red_player_tai: 0,
			red_player_xiu: 0,
			red_tai: 0,
			red_xiu: 0,
		},
		list: []
	};
	topUser();
	playGame();
	botchatRun();
}

TXPhien.findOne({}, 'id', {sort:{'id':-1}}, function(err, last) {
	// << SAFE CHECK: ensure `io` exists before assigning property to avoid crash on startup >>
	if (!!last && io) {
		io.TaiXiu_phien = last.id+1;
	}
})

let truChietKhau = function(bet, phe){
	return bet-Math.ceil(bet*phe/100);
}

// ... phần còn lại của file giữ nguyên hoàn toàn như cũ ...
// (giữ lại toàn bộ logic trong thongtin_thanhtoan, playGame, etc.)
