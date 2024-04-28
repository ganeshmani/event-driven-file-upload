'use client';
import FileUploader from '@/components/file-uploader';
import { useState } from 'react';
import {
  QueryClientContext,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download, Trash2 } from 'lucide-react';
import { getQueryClient } from '@/lib/query-client';

const DashboardPage = () => {
  const queryClient = getQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`);
      return await response.json();
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  const mutate = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/files/${id}`,
        {
          method: 'DELETE',
        },
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const _onFileUploaded = async () => {
    console.log('File uploaded');
  };

  const _handleFileDelete = async (id: string) => {
    mutate.mutate(id);
  };

  const _handleDownload = async (id: string) => {
    // api return 302 redirect to the file
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/${id}/download`,
    );

    // api return file url to download, so we can use this to download the file
    const data = await response.json();

    if (response.status == 200) {
      const link = document.createElement('a');
      link.href = data.url;

      link.setAttribute('download', data.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="flex h-screen">
      <div className="w-2/3 mt-10 p-4 ">
        <h4 className="h4 text-xl my-4 font-semibold">Files</h4>
        <div className="border rounded-md">
          {isLoading ? (
            <div className="w-full h-96 flex">
              <div role="status" className="m-auto">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : isError ? (
            <p>Error loading files</p>
          ) : (
            <ul className="divide-y divide-gray-200 p-2 overflow-auto h-96">
              {data &&
                data.map((file: any, index: number) => (
                  <li key={file.id} className="py-2">
                    <div className="flex items-center gap-x-4">
                      <h3>{index + 1}.</h3>
                      <h3 className="flex-auto font-semibold truncate text-sm leading-6 text-gray-900">
                        {file.originalFileName}
                      </h3>

                      <div className="flex flex-col">
                        <strong className="font-semibold">Created at:</strong>{' '}
                        <span className="text-gray-400">
                          {format(file.createdAt, 'dd-MM-yyy')}
                        </span>
                      </div>

                      <div className="mr-8 flex gap-x-4">
                        <button
                          onClick={() => _handleDownload(file.id)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        >
                          <Download className=" cursor-pointer" />
                        </button>
                        <button
                          onClick={() => _handleFileDelete(file.id)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        >
                          <Trash2 className="cursor-pointer " />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 px-6 truncate text-sm text-gray-400">
                      {file.contentType}
                    </p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className="w-1/3 mt-10 p-4 items-center">
        <h4 className="h4 text-xl my-4 font-semibold">Upload File</h4>
        <FileUploader onFileUploaded={_onFileUploaded} />
      </div>
    </main>
  );
};

export default DashboardPage;
