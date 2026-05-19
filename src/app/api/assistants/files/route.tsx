import { assistantId } from "@/app/assistant-config";
import { getOpenAI } from "@/app/openai";
import { NextRequest } from 'next/server';
import { Uploadable } from "openai/uploads";

// upload file to assistant's vector store
export async function POST(request: NextRequest) {
  const formData = await request.formData(); // process file as FormData
  const file = formData.get("file"); // retrieve the single file from FormData
  const vectorStoreId = await getOrCreateVectorStore(getOpenAI()); // get or create vector store

  // Check if vectorStoreId is valid
  if (!vectorStoreId) {
    return new Response('Failed to get or create vector store', { status: 500 });
  }

  // Check if file exists and is a File object
  if (!file || !(file instanceof File)) {
    return new Response('No valid file uploaded', { status: 400 });
  }

  // Use the File object directly as Uploadable
  const uploadable: Uploadable = file;

  const openai = getOpenAI();

  // upload using the file stream
  const openaiFile = await openai.files.create({
    file: uploadable,
    purpose: "assistants",
  });

  // add file to vector store
  await openai.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id,
  });
  return new Response();
}

// list files in assistant's vector store
export async function GET() {
  const openai = getOpenAI();
  const vectorStoreId = await getOrCreateVectorStore(openai);
  
  // Check if vectorStoreId is valid
  if (!vectorStoreId) {
    return new Response('Failed to get or create vector store', { status: 500 });
  }

  const fileList = await openai.vectorStores.files.list(vectorStoreId);

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.vectorStores.files.retrieve(
        file.id,
        { vector_store_id: vectorStoreId },
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    })
  );
  return Response.json(filesArray);
}

// delete file from assistant's vector store
export async function DELETE(request: NextRequest) {
  const openai = getOpenAI();
  const body = await request.json();
  const fileId = body.fileId;

  const vectorStoreId = await getOrCreateVectorStore(openai);
  
  // Check if vectorStoreId is valid
  if (!vectorStoreId) {
    return new Response('Failed to get or create vector store', { status: 500 });
  }

  try {
    await openai.vectorStores.files.delete(fileId, {
      vector_store_id: vectorStoreId,
    });
    return new Response('File deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return new Response('Failed to delete file', { status: 500 });
  }
}

/* Helper functions */

const getOrCreateVectorStore = async (openai: ReturnType<typeof getOpenAI>): Promise<string | null> => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  // if the assistant already has a vector store, return it
  const existingVectorStoreId = assistant.tool_resources?.file_search?.vector_store_ids?.[0];
  if (existingVectorStoreId) {
    return existingVectorStoreId;
  }

  // otherwise, create a new vector store and attach it to the assistant
  try {
    const vectorStore = await openai.vectorStores.create({
      name: "sample-assistant-vector-store",
    });
    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });
    return vectorStore.id;
  } catch (error) {
    console.error('Failed to create vector store:', error);
    return null;
  }
};
