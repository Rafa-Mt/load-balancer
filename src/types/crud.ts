interface CreateRequest {
  table: string;
  atributos: { [key: string]: string };
}
interface CreateResponse {
  result: string;
}

interface ReadRequest {
  table: string;
  criteria: { [key: string]: string };
}

interface ReadResponse {
  result: string;
}

interface UpdateRequest {
  table: string;
  column: string;
  value: string;
  criteria: { [key: string]: string };
}

interface UpdateResponse {
  result: string;
}

interface DeleteRequest {
  table: string;
  atributos: { [key: string]: string };
}

interface DeleteResponse {
  result: string;
}

export type CrudService = {
  Create(request: CreateRequest): CreateResponse;
  Read(request: ReadRequest): ReadResponse;
  Update(request: UpdateRequest): UpdateResponse;
  Delete(request: DeleteRequest): DeleteResponse;
  serviceName: "CrudService";
  packageName: "crud";
  [key: string]: any;
}