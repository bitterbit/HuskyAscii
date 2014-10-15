import re
import sys
sys.setrecursionlimit(10000)
PLACE_HOLDER='#'

counter=0

def main():
	img_lines = read_file('photoreplacer/input_img.txt')
	code = ''.join(read_file('photoreplacer/input_code.txt'))

	text = ''.join(img_lines)
	new_text = re.sub(r'(\s\s[^\{0}]*(\n)+([^\{0}]*\s\s))'.format(PLACE_HOLDER), r'/*\\\n\3*/', text)

	pic_builder = CodePicBuilder(code, new_text)
	write_file('photoreplacer/output.txt',pic_builder.generate_pic_code())


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


def get_usless_expression(length):
	if length >= 4:
		return '/*{0}*/'.format('*'*(length-4))
	return ' '*length

def read_file(path):
	with open(path, 'rb') as f:
		return f.readlines()

def write_file(path, text):
	with open(path, 'wb') as f:
		f.write(text)

main()