/** Shape of a jsonplaceholder `/posts/:id` resource. */
export interface Post {
  readonly id: number;
  readonly userId: number;
  readonly title: string;
  readonly body: string;
}
