from langchain_community.document_loaders import PDFPlumberLoader, DirectoryLoader
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate


# ##Document Loader
# def doc_loader(path):
#     loader=DirectoryLoader(
#        path=path,
#        glob="**/*.pdf",
#        loader_cls=PDFPlumberLoader # type: ignore
#     )
#     documents=loader.load()
#     return documents

# Change this imports line:
from langchain_community.document_loaders import PDFPlumberLoader

## Document Loader (Fixed for single files)
def doc_loader(path: str):
    # Load just the specific file the user requested!
    loader = PDFPlumberLoader(path)
    documents = loader.load()
    return documents


##Document Cleaning
def minimal_doc(docs:List[Document])->List[Document]:
    
    minimal_docs:List[Document]=[]

    for doc in docs:
        src=doc.metadata.get("source")
        minimal_docs.append(
            Document(
                page_content=doc.page_content,
                metadata={"source":src}
            )
        )

    return minimal_docs


##Documents Splitter
text_splitter = RecursiveCharacterTextSplitter(
    # Order matters: first try to split by Parts, then COs, then individual Questions
    separators=["PART-I", "PART - II", "CO1:", "CO2:", "CO3:", "CO4:", "CO5:", "\n\n", "\n", " "],
    chunk_size=1000, 
    chunk_overlap=100,
    length_function=len,
    is_separator_regex=False,
)

def get_chunks(data_path:str):
    extracted_data = doc_loader(data_path)
    cleaned_data=minimal_doc(extracted_data)
    papers = text_splitter.split_documents(cleaned_data)

    return papers

