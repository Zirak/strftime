`strftime` functionality in js. Mimicks strftime as found in C (and its descendant implementations, such in as Python and Ruby).

## Usage

### Include
In the browser, the regulat shtick

```html
<script src='strftime.js'></script>
```

In node.js, same old:

```javascript
var strftime = require('strftime').strftime;
```

### Stuff
I'm great at giving titles.

```javascript
strftime(format [, date=Date.now [, locale]])

strftime('%H:%M:%S (%z)');
//may be something like
13:12:54 (+0000)

strftime('%F %r', new Date(2013, 2, 25, 14, 03, 25));
//should definitely be this
2013-03-25 02:03:25 PM
```

The `format` argument is a string which may contain what's called "convertion specifiers". `man strftime` has, in vivid detail, each one. I've alsp included a table at the end of this page. If you omit this argument (falsy value, excluding the empty string), the return value if an object with all the convertion specifiers (see the examples section).

The 2nd `date` argument should be self-explanatory: It's the date you want to represent.

The 3rd `locale`argument is trickier, so it gets its own section! Yay!

## Localization

The optional `locale` argument is used for, well, localization, for things like the name of days or month, how AM/PM should be signified, and more coming on in the future. Here's the default locale:

```javascript
{
    //names for days of the week
	weekDays : [
		'Sunday', 'Monday', 'Tuesday', 'Wednsday',
		'Thursday', 'Friday', 'Saturday'
	],
	//month names
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
}
```

Planned: As the `toLocaleString` methods are mostly just ignored in current ("modern") js implementations, there'll be a property on the locale object specifying how complete dates and time should be represented.

## Examples

```javascript
var date = new Date(2013, 2, 25, 14, 03, 25);
//ISO 8601 extended
strftime('%Y-%m-%dT%H:%M:%SZ', date) === '2013-03-25T14:03:25Z';
//which is the same as
strftime('%FT%TZ', date)

//all of it!
strftime(null, date);
{
  "c": "3/25/2013 2:03:25 PM",
  "D": "03/25/113",
  "F": "2013-03-25",
  "r": "02:03:25 PM",
  "R": "14:03",
  "T": "14:03:25",
  "x": "3/25/2013",
  "X": "2:03:25 PM",
  "C": 20,
  "y": 113,
  "Y": 2013,
  "b": "Mar",
  "B": "March",
  "h": "Mar",
  "m": "03",
  "a": "Mon",
  "A": "Monday",
  "u": 1,
  "w": 1,
  "U": "00",
  "W": "00",
  "d": "25",
  "e": "25",
  "j": "084",
  "H": "14",
  "k": "14",
  "I": "02",
  "l": " 2",
  "p": "PM",
  "P": "pm",
  "M": "03",
  "s": 1364220205,
  "S": "25",
  "z": "+0000",
  "Z": "UTC",
  "G": "", //-\
  "g": "", //---these 3 are a major TODO
  "V": "", //-/
  "n": "\n",
  "t": "\t",
  "%": "%"
}
```

## Convertion Specifiers

Note that this is not the full list, as implementation is not complete. In the future, I intend to add several glibc extensions like `%_` or `%N` (where N is a number).

#### General formats

| Specifier | Meaning
|:---------:|---------
| %c        | Locale-sensitive date+time string
| %D        | American date (`%m/%d/%y`)
| %F        | ISO-8601 date (`%Y-%m-%d`)
| %r        | Time in 12-hour clock (`%I:%M:%S %p`)
| %R        | Time in 24-hour clock (`%H:%M`)
| %T        | Time in 24-hour clock with seconds (`%H:%M:%S`)

#### Date

| Specifier | Meaning
|:---------:|---------
|Year       | |
| %C        | Century (2 digits)
| %y        | Year (2 digits)
| %Y        | Full year (2 digits)
|Month      | |
| %b        | Abbreviated month name (Jan, Jul, Nov, ...)
| %B        | Full month name (January, July, November, ...)
| %m        | Month number in 2-digit [01, 12]
| %h        | Alias of %b
|Week       | |
| %a        | Abbreviated week name (Sun, Tue, Fri, ...)
| %A        | Full week name (Sunday, Tuesday, Friday, ...)
| %u        | Day of the week, [1, 7] where Monday=1
| %w        | Day of the week, [0, 6] where Sunday=0
| %U        | Week number of year, where 1st week starts on Sunday [00, 53]
| %W        | Week number of year, where 1st week starts on Monday [00, 53]
|Day        |
| %d        | Day of the month [01, 31]
| %e        | Day of the month [ 1, 31]
| %j        | Day of the year [001, 366]

#### Time

| Specifier | Meaning
|:----------:--------
|Hour       | |
| %H        | Hour in 24-hour clock [00, 23]
| %k        | Hour in 24-hour clock [ 0, 23]
| %I        | Hour in 12-hour clock [01, 12]
| %l        | Hour in 12-hour clock [ 1, 12]
|AM/PM      | |
| %p        | Uppercase AM/PM
| %P        | Lowercase am/pm
|Minutes    | |
| %M        | Minutes of the hour [00, 59]
|Seconds    | |
| %s        | Seconds since epoch
| %S        | Seconds of the minute [00, 60]
|Timezone   | |
| %z        | Timezone offset, +hhmm or -hhmm (+0100, -0700, ...)
| %Z        | Abbreviated timezone name (UTC, CET)

#### Misc.

| Specifier | Meaning
|:----------:--------
| %n        | Newline (\n)
| %t        | Tab (\t)
| %%        | Literal %
