// Helpers.js (Upgraded for modern Node, keep 100% old logic)

const bcrypt = require('bcryptjs');                 // đổi từ bcrypt → bcryptjs (không lỗi native)
const fs = require('fs');
const path = require('path');

// Lấy file config JSON
let getConfig = function(config){
	try {
		const file = path.join(__dirname, '../../config', config + '.json');
		const text = fs.readFileSync(file, 'utf8');
		return JSON.parse(text);
	} catch (e){
		return null;
	}
}

// Ghi file config JSON
let setConfig = function(config, data){
	try {
		const file = path.join(__dirname, '../../config', config + '.json');
		fs.writeFile(file, JSON.stringify(data), () => {});
	} catch (e){}
	data = null;
}

// Lấy file data JSON
let getData = function(name){
	try {
		const file = path.join(__dirname, '../../data', name + '.json');
		const text = fs.readFileSync(file, 'utf8');
		return JSON.parse(text);
	} catch (e){
		return null;
	}
}

// Ghi file data JSON
let setData = function(name, data){
	try {
		const file = path.join(__dirname, '../../data', name + '.json');
		fs.writeFile(file, JSON.stringify(data), () => {});
	} catch (e){}
	data = null;
}

// Mã hóa pass
let generateHash = function(password) {
	return bcrypt.hashSync(String(password), bcrypt.genSaltSync(12));
}

// So sánh pass
let validPassword = function(password, hash) {
	return bcrypt.compareSync(String(password), String(hash));
}

let cutEmail = function(email) {
	let data = email.split('@');
	let start = data[0].length > 7 ? data[0].slice(0,6) : data[0].slice(0, data[0].length-3);
	return start + '***@' + data[1];
}

let cutPhone = function(phone) {
	let start = phone.slice(0, 6);
	let end   = phone.slice(phone.length-2);
	return start + '****' + end;
}

let validateEmail = function(t) {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(t);
}

let checkPhoneZero = function(phone) {
	return /^[\+]?(?:[(][0-9]{1,3}[)]|(?:84|86|82|83|85|88|81|80|87|89|0))[0-9]{7,30}$/im.test(phone);
}

let phoneCrack2 = function(phone) {
	let data = phone.match(/^[\+]?(?:[(][0-9]{1,3}[)]|)/im);
	if (data) return phone.slice(data[0].length);
	return data;
}

let checkPhoneValid = function(phone) {
	return /^[\+]?(?:[(][0-9]{1,3}[)]|(?:84|0))[0-9]{7,10}$/im.test(phone);
}

let phoneCrack = function(phone) {
	let data = phone.match(/^[\+]?(?:[(][0-9]{1,3}[)]|(?:84|0))/im);
	if (data) {
		return {
			region: data[0],
			phone:  phone.slice(data[0].length),
		};
	}
	return data;
}

let nFormatter = function(t, e) {
	let i = [
		{ value: 1e18, symbol: 'E' },
		{ value: 1e15, symbol: 'P' },
		{ value: 1e12, symbol: 'T' },
		{ value: 1e9,  symbol: 'G' },
		{ value: 1e6,  symbol: 'M' },
		{ value: 1e3,  symbol: 'k' }
	];
	let o = /\.0+$|(\.[0-9]*[1-9])0+$/;
	for (let n = 0; n < i.length; n++)
		if (t >= i[n].value)
			return (t / i[n].value).toFixed(e).replace(o, '$1') + i[n].symbol;
	return t.toFixed(e).replace(o, '$1');
}

let anPhanTram = function(bet, so_nhan, ti_le, type = false){
	let vV = bet * so_nhan;
	let vT = type ? vV : bet;
	return vV - Math.ceil(vT * ti_le / 100);
}

// Kiểm tra chuỗi rỗng
let isEmpty = function(str) {
	return (!str || str.length === 0);
}

// Đổi số thành tiền
let numberWithCommas = function(number) {
	if (number) {
		let result = String(parseInt(number)).split('.');
		result[0] = result[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		return result.join('.');
	}
	return '0';
}

// Lấy số từ chuỗi
let getOnlyNumberInString = function(t) {
	let e = t.match(/\d+/g);
	return e ? e.join('') : '';
}

// Thêm số 0 lấp đầy
let numberPad = function(number, length) {
	let str = String(number);
	while (str.length < length) str = '0' + str;
	return str;
}

// Trộn mảng
let shuffle = function(array) {
	let m = array.length, t, i;
	while (m) {
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

// Thông báo nổ hũ
let ThongBaoNoHu = function(io, data){
	io.clients.forEach(function(client){
		if (client.admin === undefined && (client.auth === false || client.scene === 'home')) {
			client.red({pushnohu:data});
		}
	});
}

let ThongBaoBigWin = function(io, data){
	io.clients.forEach(function(client){
		if (client.admin === undefined && (client.auth === false || client.scene === 'home')) {
			client.red({news:{t:data}});
		}
	});
}

// VIP points update
let pushDailyVIP = function(obj){
	const VIPServices = require('../Models/VIPServices');
	const DaiLy = require('../Models/DaiLy');
	var isC2 = false;
	obj.total = obj.total / global.VIPCount;

	var create = {name:obj.daily, reason:obj.reason, type:obj.type, total:obj.total};

	DaiLy.findOne({nickname: obj.daily}, function(err, data){
		if (!!data) {
			if (data.rights == 11) {
				isC2 = true;
				obj.total = obj.total * 0.5;
			}
			create.vipFirst = data.vip * 1;
			create.vipLast  = data.vip * 1 + obj.total;
			create.time = new Date();

			VIPServices.create(create);
			DaiLy.findOneAndUpdate({nickname: obj.daily}, {$inc:{vip:obj.total}}, function(err, resultDl){
				if (!!resultDl) {
					DaiLy.findOneAndUpdate({nickname: resultDl.createdBy}, {$inc:{vip:obj.total}}, function(err, parent){
						if (!!parent) {
							var createParrent = {
								name: parent.nickname,
								reason: "Cộng điểm VIP từ đại lý "+ obj.daily,
								type: obj.type,
								total: obj.total,
								vipFirst: parent.vip,
								vipLast: parent.vip + obj.total,
								time: new Date(),
							};
							VIPServices.create(createParrent);

							if (isC2) {
								DaiLy.findOneAndUpdate({rights: 9}, {$inc:{vip:obj.total*2}}, function(err, tdl){
									if (!!tdl) {
										var createTdl = {
											name: tdl.nickname,
											reason: "Cộng điểm VIP từ đại lý "+ obj.daily,
											type: obj.type,
											total: obj.total*2,
											vipFirst: tdl.vip,
											vipLast: tdl.vip + obj.total*2,
											time: new Date(),
										};
										VIPServices.create(createTdl);
									}
								});
							}
						}
					});
				}
			})
		}
	})
}

let RandomUserName = function(length){
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++){
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

let MissionAddCurrent = function(uid,amount) {
	let UserMission = require('../Models/UserMission');
	UserMission.findOne({uid:uid, active:true, achived2:false}, {}, {sort:{time:-1}}, function(err,update){
		if (!!update)
			UserMission.updateOne({_id:update._id}, {$inc:{current:amount}}).exec();
	});
}

let _formatMoneyVND = (num, digits) => {
	const si = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "K" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E9, symbol: "G" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E18, symbol: "E" }
	];
	var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var i;
	for (i = si.length - 1; i > 0; i--) {
		if (num >= si[i].value) break;
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

module.exports = {
	generateHash:  generateHash,
	validPassword: validPassword,
	phoneCrack2:   phoneCrack2,
	checkPhoneZero: checkPhoneZero,
	anPhanTram:    anPhanTram,
	isEmpty:       isEmpty,
	numberWithCommas: numberWithCommas,
	getOnlyNumberInString: getOnlyNumberInString,
	numberPad:       numberPad,
	shuffle:         shuffle,
	validateEmail:   validateEmail,
	checkPhoneValid: checkPhoneValid,
	phoneCrack:      phoneCrack,
	nFormatter:      nFormatter,
	ThongBaoNoHu:    ThongBaoNoHu,
	RandomUserName:  RandomUserName,
	pushDailyVIP:    pushDailyVIP,
	MissionAddCurrent: MissionAddCurrent,
	ThongBaoBigWin:  ThongBaoBigWin,
	cutEmail:        cutEmail,
	cutPhone:        cutPhone,
	getConfig:       getConfig,
	setConfig:       setConfig,
	getData:         getData,
	setData:         setData,
	_formatMoneyVND: _formatMoneyVND,
};
