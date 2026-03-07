from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from typing import List


### HeatMap Parser
class HeatmapCell(BaseModel):
    topic: str = Field(description="The topic or subtopic name ")
    year: str = Field(description="The academic year of the exam extracted from the header")
    marks: float = Field(description="The total marks for this topic, calculated based on the 'Attempt any X' instructions")

class HeatmapData(BaseModel):
    cells: List[HeatmapCell] = Field(description="A list of all topic-year intersections found in the document")


heatmap_parser=PydanticOutputParser(pydantic_object=HeatmapData)

##Pie Chart Parser
class ChapterShare(BaseModel):
    chapter: str = Field(description="The name of the chapter or Course Outcome ")
    total_marks: float = Field(description="The total marks this chapter has carried across ALL analyzed years")

class PieChartData(BaseModel):
    subject: str = Field(description="The name of the subject")
    shares: List[ChapterShare] = Field(description="List of chapters and their total cumulative marks")

pie_parser = PydanticOutputParser(pydantic_object=PieChartData)