import { Plus } from "lucide-react";
import { products } from "@/lib/data";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Wordmark } from "@/components/Wordmark";

export default function AdminPage() {
  return (
    <main className="admin-page">
      <header className="admin-header">
        <Wordmark admin light />
        <nav aria-label="Admin actions">
          <button className="btn btn--secondary" type="button">
            <Plus aria-hidden="true" size={19} />
            Add product
          </button>
          <button className="btn btn--outline btn--light" type="button">
            Log out
          </button>
        </nav>
      </header>

      <section className="admin-content">
        <div className="admin-table-card">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 4).map((product) => (
                <tr key={product.slug}>
                  <td>
                    <div className="admin-product-cell">
                      <ImagePlaceholder className="admin-thumb" label="" />
                      <strong>{product.title}</strong>
                    </div>
                  </td>
                  <td>{product.vendor}</td>
                  <td>
                    <strong>{product.price}</strong>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button">edit</button>
                      <button type="button">del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="admin-form-card" aria-labelledby="admin-form-heading">
          <h1 id="admin-form-heading">Add / edit product</h1>
          <form>
            <label>
              Title
              <input type="text" placeholder="Product title" />
            </label>
            <label>
              Category
              <input type="text" placeholder="Select category" />
            </label>
            <label>
              Price
              <input type="text" placeholder="£0.00" />
            </label>
            <label>
              Vendor
              <input type="text" placeholder="Assign vendor" />
            </label>
            <label>
              Image URL
              <input type="url" placeholder="https://..." />
            </label>
            <label>
              External product URL
              <input type="url" placeholder="https://..." />
            </label>
            <label className="admin-form-card__wide">
              Description
              <textarea placeholder="Description..." />
            </label>
            <label>
              Availability
              <input type="text" placeholder="In stock" />
            </label>
            <button className="btn btn--primary admin-form-card__wide" type="button">
              Save product
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
