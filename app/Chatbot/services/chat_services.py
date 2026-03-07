from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_pinecone import PineconeVectorStore
from core.pinecone_client import index
from models.model import chat_model, get_embedding_model
from ChatBot.utils.memory import get_session_history
import tempfile 


llm = chat_model()
parser = StrOutputParser()
embedding=get_embedding_model()

chat_prompt = ChatPromptTemplate([
    ("system", "You are a friendly academic assistant. Use the following context to answer:\n\n{context}. Don not return the answer with **symbols. Return plain text"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{user_message}")
])

chain = chat_prompt | llm | parser

runnable = RunnableWithMessageHistory(
    chain,
    get_session_history=get_session_history,
    input_messages_key="user_message",
    history_messages_key="history",
)


def chat_with_namespace(user_message: str, namespace: str, session_id: str):

    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embedding,
        namespace=namespace
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    docs = retriever.invoke(user_message)
    context = "\n\n".join([doc.page_content for doc in docs])

    response = runnable.invoke(
        {
            "user_message": user_message,
            "context": context
        },
        config={"configurable": {"session_id": session_id}}
    )

    
    return response