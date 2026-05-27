import { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import useCollectionStore from '../store/collectionStore.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { exportCollection } from '../api/collection.api.js';
import toast from 'react-hot-toast';

const Collections = () => {
  const { collections, fetchCollections, createCollection, deleteCollection, importCollection } =
    useCollectionStore();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchCollections().finally(() => setLoading(false));
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCollection({ name: newName.trim(), description: newDesc.trim() });
      toast.success('Collection created');
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
    } catch {
      toast.error('Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCollection(id);
      if (selected?._id === id) setSelected(null);
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleExport = async (id) => {
    try {
      const blob = await exportCollection(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collection-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await importCollection(json);
      toast.success('Imported');
    } catch {
      toast.error('Import failed — invalid JSON');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
          Collections
        </h1>
        <div className="flex gap-2">
          <label>
            <Button variant="secondary" as="span">
              <ArrowUpTrayIcon className="w-4 h-4" /> Import
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <Button onClick={() => setShowCreate(true)}>
            <PlusIcon className="w-4 h-4" /> New Collection
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#64748b' }}>
          <p className="text-lg mb-2">No collections yet.</p>
          <p className="text-sm">Create a collection to group and save your API requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col._id}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                background: selected?._id === col._id ? '#252836' : '#1e2130',
                border: `1px solid ${selected?._id === col._id ? '#6366f1' : '#2e3148'}`,
              }}
              onClick={() => setSelected(col)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>
                  {col.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExport(col._id); }}
                    title="Export"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" style={{ color: '#64748b' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(col._id); }}
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" style={{ color: '#64748b' }} />
                  </button>
                </div>
              </div>
              {col.description && (
                <p className="text-xs mb-2 line-clamp-2" style={{ color: '#64748b' }}>
                  {col.description}
                </p>
              )}
              <p className="text-xs" style={{ color: '#64748b' }}>
                {col.requests?.length ?? 0} requests · {col.folders?.length ?? 0} folders
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Selected collection detail */}
      {selected && (
        <div className="rounded-xl p-4 mt-2" style={{ background: '#1e2130', border: '1px solid #2e3148' }}>
          <h2 className="font-semibold mb-3" style={{ color: '#e2e8f0' }}>
            {selected.name} — Requests
          </h2>
          {selected.requests?.length === 0 ? (
            <p className="text-sm" style={{ color: '#64748b' }}>No requests saved.</p>
          ) : (
            <div className="space-y-2">
              {selected.requests?.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg"
                  style={{ background: '#252836' }}
                >
                  <span
                    className="font-mono text-xs font-bold w-14 text-center"
                    style={{ color: '#818cf8' }}
                  >
                    {req.method}
                  </span>
                  <span className="text-sm flex-1 truncate" style={{ color: '#e2e8f0' }}>
                    {req.name || req.url}
                  </span>
                  <span className="text-xs truncate max-w-48" style={{ color: '#64748b' }}>
                    {req.url}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Collection"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button loading={creating} onClick={handleCreate}>
              Create
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Name"
            placeholder="My API Collection"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Description (optional)"
            placeholder="What is this collection for?"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Collections;
