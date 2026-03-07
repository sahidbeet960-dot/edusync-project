from langchain_core.prompts import PromptTemplate
from langchain_core.prompts import PromptTemplate


from app.models.model import chat_model

##importing parser from parser.py
from app.Infographs.parser import heatmap_parser,pie_parser


llm=chat_model()
parser=heatmap_parser

##Prompt Template
template = """
You are an Academic Examination Data Auditor.

You are provided with multiple years of exam papers:
{papers}

Your task is to perform a thorough, question-by-question audit across all provided papers.

==============================
AUDIT OBJECTIVES
==============================

1. Year Identification (MANDATORY)
   - Identify and process distinct academic years.
   - Detect 4-digit year headers (e.g., 2022, 2023, 2024).
   - Do not stop analysis until all three years are fully processed.

2. Granular Topic Extraction
   - Extract the most specific and precise sub-topic for each individual question.
   - Avoid broad category labels.
   - Prefer precise conceptual names (e.g., instead of "Data Structures", use "Binary Search Tree Insertion", "AVL Rotation", etc.).
   - Ensure every question maps to a clear academic concept.

3. Marks Extraction and Calculation (MANDATORY)
   - Extract the numerical marks associated with EVERY question.
   - Detect marks from:
       • End of question statements
       • Section headers
       • Expressions like "2 × 10 = 20", "7+8=15", etc.
   - If a choice is given (e.g., "Attempt any two"), compute the total possible marks for that section.
   - Always assign a numerical mark value to each extracted topic.

==============================
ANALYSIS GUIDELINES
==============================

- Scan the entire paper for each year, including all sections (e.g., Part I, Part II, Section A, Section B).
- Do not skip optional sections.
- If course outcomes (COs) or learning objectives are present, use them only to help clarify ambiguous topics.
- Do not infer marks if they are not present.
- Do not fabricate missing information.

==============================
OUTPUT FORMAT
==============================

For EVERY question found, generate a structured entry with:

- Year: [4-digit year]
- Topic: [Precise sub-topic]
- Marks: [Numerical value only]

Return the results strictly in the required structured format.

{parser_format}
"""
prompt=PromptTemplate(
    template =template,
    input_variables=["papers"],
    partial_variables={"parser_format":heatmap_parser.get_format_instructions()}
)



template_pie = """
You are a Curriculum Analyst. Your goal is to analyze multiple years of exam papers: {papers} and determine the overall importance of each chapter.

### OBJECTIVES:
1. **Chapter Identification**: Scan the provided text to identify more weighted chapters.
2. **Global Summation**: For every specific topic found, calculate the TOTAL marks it has carried across ALL years provided in the text.
3. **Choice Logic**: When summing marks, always calculate the maximum scorable marks per topic based on 'Attempt any X' instructions.
4. **Consistency**: Group sub-topics into their parent chapters. For example, questions on 'Huffman', 'RLC', and 'LZW' should all be summed under 'CO2: Lossless Compression'.

### SUBJECT CONTEXT:
Identify the subject name from the header (e.g., 'Multimedia').

### OUTPUT REQUIREMENTS:
Provide a cumulative list where each chapter appears only once with its total combined weightage from all papers.

{parser_format}
"""

pie_prompt = PromptTemplate(
    template=template_pie,
    input_variables=["papers"],
    partial_variables={"parser_format": pie_parser.get_format_instructions()}
)

def heatmap_chain():
    chain=prompt | llm | parser
    return chain

def pie_chain():
    p_chain=pie_prompt | llm | pie_parser
    return p_chain