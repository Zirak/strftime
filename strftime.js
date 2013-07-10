var strftime = (function () {

var defLocale = {
	weekDays : [
		'Sunday', 'Monday', 'Tuesday', 'Wednsday',
		'Thursday', 'Friday', 'Saturday'
	],
	month : [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	],
	// am/pm names. uppercase properties are uppercase, lowercase are lowercase.
	// in case lowercase are missing, they'll be the toLowerCase versions of the
	// uppercase. the same will *not* be done with missing uppercase.
	ampm : {
		AM : 'AM',
		PM : 'PM'
	}
};

// pad `start`, adding `filler` to the left until `min` characters
var leftPad = function (start, filler, min) {
	var str = String(start);
	min = min || 2;

	//meh
	while (str.length < min) {
		str = filler + str;
	}

	return str;
};
//use leftPad, but with respect to the flags (such as %_ which means to
// always pad with spaces)
//we only really care about two flag properties:
// * padder - which string to use as a padder/filler
// * length - how long the string should be
//the default object should contain both, but defaults to
// * padder = space
// * length = 2
var pad = function (str, flags, def) {
	//no padding
	if (flags.padder === '') {
		return str;
	}

	def = def || {};

	return leftPad(
		str,
		flags.padder || def.padder || ' ',
		flags.length || def.length || 2);
};

//most js implementations simply disregard any locale and return the non
// locale-sensitive string. this is a Bad Thing™. so whenever you see a
// toLocaleSomething, question it. this is definitely a TODO.
//the date object each converter receives is augmented with two properties:
// the locale and flags.
//see `man strftime` for the full explanations
var converters = {
	//formats
	// locale-sensitive date+time
	c : function (date) {
		return date.toLocaleString();
	},
	// American-style %m/%d/%y
	D : function (date) {
		return [this.m(date), this.d(date), this.y(date)].join('/');
	},
	// ISO-8601 %Y-%m-%d
	F : function (date) {
		return [this.Y(date), this.m(date), this.d(date)].join('-');
	},
	// %I:%M:%S %p (11:01:01 PM)
	r : function (date) {
		return [this.I(date), this.M(date), this.S(date)].join(':') + ' ' +
			this.p(date);
	},
	// %H:%M (23:12)
	R : function (date) {
		return this.H(date) + ':' + this.M(date);
	},
	// %H:%M:%S (23:01:01)
	T : function (date) {
		return [this.H(date), this.M(date), this.S(date)].join(':');
	},
	// date string according to the locale
	x : function (date) {
		return date.toLocaleDateString();
	},
	// locale-sensitive time string
	X : function (date) {
		return date.toLocaleTimeString();
	},

	//date

	//year-related
	// 2-digit century
	C : function (date) {
		return Math.floor(date.getFullYear() / 100);
	},
	// 2-digit year (full year without century), [00, 99]
	y : function (date) {
		return date.getYear();
	},
	// 4-digit year (full year).
	Y : function (date) {
		return date.getFullYear();
	},

	//month-related
	// abbr. month name
	b : function (date) {
		return (/^\S+\s(\S+)/).exec(date)[1];
	},
	// full month name
	B : function (date) {
		return date.locale.month[date.getMonth()];
	},
	// alias of b
	h : function (date) {
		return this.b(date);
	},
	// month. [01, 12]
	m : function (date) {
		return pad(date.getMonth()+1, date.flags, {padder:'0'});
	},

	//week-related
	// abbr. week name
	a : function (date) {
		return (/^\S+/).exec(date)[0];
	},
	// full week name
	A : function (date) {
		return date.locale.weekDays[date.getDay()];
	},
	// day of the week, [Monday=1, 7]
	u : function (date) {
		return date.getDay();
	},
	// day of the week, [Sunday=0, 6]
	w : function (date) {
		return date.getDay(); //it shouldn't be this way
	},
	// week number, [00, 53], starting with 1st Sunday
	U : function (date) {
		var msBeginOfYear = (new Date(date.getYear(), 0, 1)).getDate();

		//1(we) = 7(day/we) * 24(h/day) * 60(min/h) * 60(h/sec) * 1000(ms/sec)
		var weeks = Math.floor(msBeginOfYear / 6048e5);
		return pad(weeks, date.flags, {padder:'0'});
	},
	// week number, [00, 53], starting with 1st Monday
	W : function (date) {
		var beginOfYear = new Date(date.getYear(), 0, 1);

		while (beginOfYear.getDay() !== 1) {
			beginOfYear.setDate(beginOfYear.getDate() + 1);
		}

		var msBeginOfYear = beginOfYear.getDate(),
			weeks = Math.floor(msBeginOfYear / 6048e5);

		return pad(weeks, date, {padder:'0'});
	},

	//day-related
	// day of the month as 2 digit [01, 31]
	d : function (date) {
		return pad(date.getDate(), date.flags, {padder:'0'});
	},
	// day of the month [ 1, 31]
	e : function (date) {
		return pad(date.getDate(), date.flags);
	},

	// day of the year. [001, 366]
	j : function (date) {
		var msBeginOfYear = (new Date(date.getFullYear(), 0, 1)).getTime();

		//1(day) = 24(h/day) * 60(min/h) * 60(sec/min) * 1000(ms/sec)
		//the +1 is to account for the current day
		var days = Math.floor((+date - msBeginOfYear) / 864e5) + 1;

		return pad(days, date.flags, {padder:'0', length:3});
	},

	//time

	//hour related
	// hour in base 24. [00, 23]
	H : function (date) {
		return pad(date.getHours(), date.flags, {padder:'0'});
	},
	// hour in base 24. [ 0, 23]
	k : function (date) {
		return pad(date.getHours(), date.flags);
	},
	// hour in base 12. [01, 12]
	I : function (date) {
		var modulos = date.getHours() % 12;
		//24 and 12 => 12. both %12 are 0
		modulos = modulos || 12;

		return pad(modulos, date.flags, {padder:'0'});
	},
	// hour in base 12. [ 1, 12]
	l : function (date) {
		var modulos = date.getHours() % 12;
		//24 and 12 => 12
		modulos = modulos || 12;

		return pad(modulos, date.flags);
	},

	//am/pm
	// AM or PM
	p : function (date) {
		var hours = date.getHours();
		return date.getHours() < 12 ?
			date.locale.ampm.AM :
			date.locale.ampm.PM;
	},
	// am or pm (lowercase). isn't it odd, lowercase p for uppercase?
	P : function (date) {
		var hours = date.getHours();

		var ampm = date.locale.ampm;
		if (hours < 12) {
			return ampm.am ?
				ampm.am :
				ampm.AM.toLowerCase();
		}

		return ampm.pm ?
			ampm.pm :
			ampm.PM.toLowerCase();
	},

	// minutes. [00, 59]
	M : function (date) {
		return pad(date.getMinutes(), date.flags, {padder:'0'});
	},

	//seconds
	// seconds since epoch.
	s : function (date) {
		return Math.floor(date.getTime() / 1000);
	},
	// seconds. [00, 60] (60 for leap-seconds)
	S : function (date) {
		return pad(date.getSeconds(), date.flags, {padder:'0'});
	},

	//timezone
	// timezone offset (+hhmm or -hhmm)
	z : function (date) {
		return (/(\+|-)\d{4}/).exec(date)[0];
	},
	// timezone name or abbr.
	Z : function (date) {
		return (/\(([^\)]+)/).exec(date)[1];
	},

	//modifiers
	//E ?
	//O ?

	//TODO
	G : function () { return ''; },
	g : function () { return ''; },
	V : function (date) { return ''; },

	//misc.
	n : function () {
		return '\n';
	},
	t : function () {
		return '\t';
	},
	'%' : function () {
		return '%';
	}
};

var modifiers = {
	'_' : function (flags) {
		flags.padder = ' ';
	},
	'-' : function (flags) {
		flags.padder = '';
	},
	'0' : function (flags) {
		flags.padder = '0';
	},
	'^' : function (flags) {
		flags.uppercase = true;
	},
	'#' : function (flags) {
		flags.invertCase = true;
	}
};

function applyFlags (str, flags) {
	if (flags.uppercase) {
		return str.toUpperCase();
	}
	if (flags.invertCase) {
		return [].map.call(str, function invertCase(ch) {
			var lowered = ch.toLowerCase();

			return ch === lowered ? ch.toUpperCase() : lowered;
		}).join('');
	}

	return str;
}

function dumpAll (date) {
	return Object.keys(converters).reduce(function dumpMod (ret, conv) {
		ret[conv] = converters[conv](date);

		return ret;
	}, {});
}

var hooks = new RegExp(
	'%(' +
		Object.keys(modifiers).join('|') +
	')?(' +
		Object.keys(converters).join('|') +
	')', 'g');

return function strftime (format, date, locale) {
	if (date) {
		date = new Date(date);
	}
	else {
		date = new Date();
	}

	date.locale = locale || defLocale;
	date.flags = {};

	if (!format && format !== '') {
		return dumpAll(date, locale);
	}

	return format.replace(hooks, function replace (hook, mod, conv) {
		var flags = date.flags = {};
		if (mod) {
			modifiers[mod](flags);
		}

		var res = converters[conv](date);
		return applyFlags(res, flags);
	});
};

})();

if (typeof module !== 'undefined' && typeof exports !== 'undefined') {
	// check if called directly
	if (require.main === module) {
		console.log(strftime(process.argv[2], process.argv[3]));
	}
	//otherwise, expose it
	else {
		exports.strftime = strftime;
	}
}
