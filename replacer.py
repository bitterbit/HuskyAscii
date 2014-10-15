import re
import sys
sys.setrecursionlimit(10000)
PLACE_HOLDER='#'

counter=0

def main():
	#Read files
	img_lines = read_file('photoreplacer/input_img.txt')
	code = ''.join(read_file('photoreplacer/input_code.txt'))

	#take only a small part
	text = ''.join(img_lines)
	new_text = re.sub(r'(\s\s[^\{0}]*(\n)+([^\{0}]*\s\s))'.format(PLACE_HOLDER), r'/*\\\n\3*/', text)

	pic_builder = CodePicBuilder(code, new_text)
	write_file('photoreplacer/output.txt',pic_builder.generate_pic_code())


	# b = split_to_char_types(''.join(img_lines))
	# print b
	#s = putCodeInPicture(new_text, exps)
	#write_file('photoreplacer/out.txt', s);




class CodePicBuilder():
	def __init__(self, code, pic_plcaeholder):
		self.code_exp = self.get_code_expressions(code)
		self.pic_parts = self.split_img_similar_chars(pic_plcaeholder)

	def generate_pic_code(self):
		parts = []

		for part in self.pic_parts:
			if part[0] == PLACE_HOLDER:
				p = self.put_code_in_placeholders(part)
			else:
				p=part
			parts.append(p)
		result = ''.join(parts)
		print 'length left:', len(''.join(self.code_exp)), '. code left:', ''.join(self.code_exp)
		return result

	def put_code_in_placeholders(self, placeholders):
		if(placeholders.find(PLACE_HOLDER) == -1):
			return placeholders

		if len(self.code_exp) > 0:
			exp = self.code_exp.pop(0)
			if len(exp) <= len(placeholders):
				
				rest = self.put_code_in_placeholders(placeholders[len(exp):])
				#print 'exp: ',exp
				return exp + rest 
			else:
				self.code_exp.insert(0, exp)

		return get_usless_expression(len(placeholders))

	@staticmethod
	def split_img_similar_chars(img_string):
		arr=[]
		for ch in img_string:
			if len(arr)==0 or arr[-1][0] != ch:
				arr.append(ch)
			else:
				arr[-1] += ch
		return arr

	@staticmethod
	def get_code_expressions(code):
		chars = list(code)
		expressions = []
		for ch in chars:
			if ch == '\r' or ch == '\n':
				continue
			elif len(expressions) > 0 and (CodePicBuilder.is_unsepreable(ch) and CodePicBuilder.is_unsepreable(expressions[-1])) :
				expressions[-1] += ch
			else:
				expressions.append(ch)
		return expressions

	@staticmethod
	def is_unsepreable(expression):
		return re.match('[A-Za-z\+\\\'\\\\]', expression)


# def putCodeInPicture(picture, code_expressions):
# 	global counter
# 	counter += 1
# 	print counter
# 	index = picture.find(PLACE_HOLDER)

# 	if index<0:
# 		return picture

# 	if len(code_expressions) != 0:
# 		exp = code_expressions[0]
# 		if picture[index:index+len(exp)] == len(exp)*PLACE_HOLDER:
# 			p = replace_str(picture, exp, index)
# 			return putCodeInPicture(p, code_expressions[1:])

# 	length = last_index_in_row(picture[index:], PLACE_HOLDER)
# 	usless_exp = get_usless_expression(length)

# 	return putCodeInPicture(replace_str(picture, usless_exp, index), code_expressions)

# def last_index_in_row(string, char):
# 	for i in xrange(len(string)):
# 		if string[i] != char:
# 			return i

# 	return len(string)-1


# def replace_str(string, replace_str, start_index=0):
# 	replace_len = len(replace_str)

# 	if len(string) >= start_index+replace_len:
# 		return '{0}{1}{2}'.format(string[:start_index], replace_str, string[start_index+replace_len:])

# 	raise Exception('replace to long index={2} replace_len={0} string_len={1}'.format(replace_len, len(string), start_index)) 

def get_usless_expression(length):
	if length >= 4:
		return '/*{0}*/'.format('*'*(length-4))
	return ' '*length
	# if length == 1:
	# 	return ' '
	# elif length == 2:
	# 	return '  '
	# elif length == 3:
	# 	return '   '
	# elif length == 4:
	# 	return '/**/'
	# else:
	# 	return '/*{0}*/'.format('*'*(length-4))

# def get_max_length(string_arr):
# 	maximum = len(string_arr[0])
# 	for line in string_arr:
# 		if maximum < len(line):
# 			maximum = len(line)
# 	return maximum

def read_file(path):
	with open(path, 'rb') as f:
		return f.readlines()

def write_file(path, text):
	with open(path, 'wb') as f:
		f.write(text)

main()