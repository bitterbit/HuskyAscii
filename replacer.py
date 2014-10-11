import re
import sys
sys.setrecursionlimit(10000)
placeholder='#'

def main():
	#Read files
	img_lines = read_file('res/input.txt')
	code = ''.join(read_file('res/code.txt'))

	#take only a small part
	text = ''.join(img_lines)
	new_text = re.sub(r'(\s\s[^\{0}]*(\n)+[^\{0}]*\s\s)'.format(placeholder), r'/*\1*/', text)

	#split code to expressions
	exps = get_code_expressions(code)

	s = putCodeInPicture(new_text, exps)
	write_file('res/out.txt', s);

def putCodeInPicture(picture, code_expressions):
	index = picture.find(placeholder)

	if index<0:
		return picture

	if len(code_expressions) != 0:
		exp = code_expressions[0]
		if picture[index:index+len(exp)] == len(exp)*placeholder:
			p = replace_str(picture, exp, index)
			return putCodeInPicture(p, code_expressions[1:])

	length = last_index_in_row(picture[index:], placeholder)
	usless_exp = get_usless_expression(length)

	return putCodeInPicture(replace_str(picture, usless_exp, index), code_expressions)

def last_index_in_row(string, char):
	for i in xrange(len(string)):
		if string[i] != char:
			return i

	return len(string)-1


def replace_str(string, replace_str, start_index=0):
	replace_len = len(replace_str)

	if len(string) >= start_index+replace_len:
		return '{0}{1}{2}'.format(string[:start_index], replace_str, string[start_index+replace_len:])

	raise Exception('replace to long index={2} replace_len={0} string_len={1}'.format(replace_len, len(string), start_index)) 

def get_usless_expression(length):
	if length == 1:
		return ' '
	elif length == 2:
		return '  '
	elif length == 3:
		return '   '
	elif length == 4:
		return '/**/'
	else:
		return '/*{0}*/'.format('*'*(length-4))

def get_code_expressions(code):
	chars = list(code)
	expressions = []
	for ch in chars:
		if ch == '\r' or ch == '\n':
			continue
		elif len(expressions) > 0 and (is_unsepreable(ch) and is_unsepreable(expressions[-1])) :
			expressions[-1] += ch
		else:
			expressions.append(ch)
	return expressions

def is_unsepreable(expression):
	return re.match('[A-Za-z\+\\\'\\\\]', expression)

def get_max_length(string_arr):
	maximum = len(string_arr[0])
	for line in string_arr:
		if maximum < len(line):
			maximum = len(line)
	return maximum

def read_file(path):
	with open(path, 'rb') as f:
		return f.readlines()

def write_file(path, text):
	with open(path, 'wb') as f:
		f.write(text)

main()