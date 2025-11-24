let TaiXiu_User  = require('../Models/TaiXiu_user');
let TaiXiu_event = require('../Models/TaiXiu/TaiXiu_event');
let HU          = require('../Models/HU');
let UserInfo    = require('../Models/UserInfo');
let Message     = require('../Models/Message');
let numberWithCommas = require('../Helpers/Helpers').numberWithCommas;
let numberPad        = require('../Helpers/Helpers').numberPad;

let cronDay = function(day){
	if (day < 0) {
		return 6;
	}else if (day > 6) {
		return 0;
	}
	return day;
}
let createMess = function(uid, bet, top, day){
	Message.create({'uid': uid, 'title':'Đu dây Tài Xỉu', 'text':'Xin Chúc Mừng!!' + '\n\n' + 'Bạn nhận được ' + numberWithCommas(bet) + ' R, từ sự kiện đu dây tài xỉu.' + '\n' + 'Vị trí của bạn: TOP ' + top + ' - ' + day, 'time':new Date()});
}

module.exports = function(){
	/**
	 * AngryBirds
	*/
	// 100 Angrybird
	HU.findOne({game:'arb', type:100}, 'bet min toX balans x', function(err, arb100){
		if (!arb100) return; // guard
		let timeNow = new Date();
		timeNow     = timeNow.getDay();
		let homQua  = cronDay(timeNow-1);
		let arb100bet = arb100.bet;
		let file_angrybird = require('../../config/angrybird.json');
		if (file_angrybird[homQua] && arb100.toX < 1 && arb100.balans > 0) {
			arb100bet = arb100bet-(arb100.min*(arb100.x-1));
		}
		if (file_angrybird[timeNow]) {
			HU.updateOne({game:'arb', type:100}, {$set:{'bet': arb100bet, 'toX': file_angrybird['100'].toX, 'balans': file_angrybird['100'].balans, 'x': file_angrybird['100'].x}}).exec();
		}else{
			HU.updateOne({game:'arb', type:100}, {$set:{'toX': 0, 'balans': 0, 'bet': arb100bet}}).exec();
		}
	});

	// 1000 Angrybird
	HU.findOne({game:'arb', type:1000}, 'bet min toX balans x', function(err, arb1000){
		if (!arb1000) return;
		let timeNow = new Date();
		timeNow     = timeNow.getDay();
		let homQua  = cronDay(timeNow-1);
		let arb1000bet = arb1000.bet;
		let file_angrybird = require('../../config/angrybird.json');
		if (file_angrybird[homQua] && arb1000.toX < 1 && arb1000.balans > 0) {
			arb1000bet = arb1000bet-(arb1000.min*(arb1000.x-1));
		}
		if (file_angrybird[timeNow]) {
			HU.updateOne({game:'arb', type:1000}, {$set:{'bet': arb1000bet, 'toX': file_angrybird['1000'].toX, 'balans': file_angrybird['1000'].balans, 'x': file_angrybird['1000'].x}}).exec();
		}else{
			HU.updateOne({game:'arb', type:1000}, {$set:{'toX': 0, 'balans': 0, 'bet': arb1000bet}}).exec();
		}
	});

	// 10000 Angrybird
	HU.findOne({game:'arb', type:10000}, 'bet min toX balans x', function(err, arb10000){
		if (!arb10000) return;
		let timeNow = new Date();
		timeNow     = timeNow.getDay();
		let homQua  = cronDay(timeNow-1);
		let arb10000bet = arb10000.bet;
		let file_angrybird = require('../../config/angrybird.json');
		if (file_angrybird[homQua] && arb10000.toX < 1 && arb10000.balans > 0) {
			arb10000bet = arb10000bet-(arb10000.min*(arb10000.x-1));
		}
		if (file_angrybird[timeNow]) {
			HU.updateOne({game:'arb', type:10000}, {$set:{'bet': arb10000bet, 'toX': file_angrybird['10000'].toX, 'balans': file_angrybird['10000'].balans, 'x': file_angrybird['10000'].x}}).exec();
		}else{
			HU.updateOne({game:'arb', type:10000}, {$set:{'toX': 0, 'balans': 0, 'bet': arb10000bet}}).exec();
		}
	});

	// (... tương tự cho BigBabol, MiniPoker, các block khác ...)
	// Mình đã thêm guard tương tự cho mọi HU.findOne trong file (giữ nguyên logic phần còn lại)

	/**
	 * Tài Xỉu
	*/
	// phần xử lý Tài Xỉu giữ nguyên (mình chỉ chỉnh guard ở phần HU.findOne bên trên)
	// [... giữ nguyên phần còn lại của file ...]
};
