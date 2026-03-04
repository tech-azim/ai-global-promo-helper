"use client";

import { useEffect, useState, useCallback } from "react";
import { Customer } from "@/types";
import {
  Card,
  Button,
  Input,
  Modal,
  Form,
  Skeleton,
  Typography,
  message,
  Tag,
  Avatar,
  Select,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SUGGESTED_TAGS = [
  "sweet drinks",
  "caramel",
  "oat milk",
  "matcha",
  "latte",
  "cappuccino",
  "less sugar",
  "healthy",
  "non-dairy",
  "cold brew",
  "extra ice",
  "vanilla",
  "pastry lover",
  "morning",
  "workshop",
  "manual brew",
  "single origin",
  "flat white",
  "americano",
  "chocolate",
  "taro",
  "hazelnut",
  "gula aren",
];

// ─── Customer Form ─────────────────────────────────────────────────────────────
function CustomerForm({
  customer,
  onSaved,
  onCancel,
}: {
  customer: any;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    form.setFieldsValue({
      name: customer?.name ?? "",
      contact: customer?.contact ?? "",
      favorite_drink: customer?.favorite_drink ?? "",
      tags: customer?.tags ?? [],
    });
  }, [customer, form]);

  const handleSave = async (values: {
    name: string;
    contact: string;
    favorite_drink: string;
    tags: string[];
  }) => {
    setSaving(true);
    try {
      const url = customer ? `/api/customers/${customer.id}` : "/api/customers";
      const method = customer ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          contact: values.contact?.trim() || null,
          favorite_drink: values.favorite_drink?.trim() || null,
          tags: values.tags ?? [],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      messageApi.success(
        customer ? "Customer diperbarui" : "Customer ditambahkan",
      );
      onSaved();
    } catch (err: any) {
      messageApi.error(err.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={false}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          label={
            <Text strong style={{ color: "#3d2314" }}>
              Nama *
            </Text>
          }
          name="name"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input
            placeholder="Nama customer"
            size="large"
            style={{ borderRadius: 8, borderColor: "#e8d5c4" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Text strong style={{ color: "#3d2314" }}>
              Kontak{" "}
              <Text style={{ color: "#a07858", fontWeight: 400 }}>
                (opsional)
              </Text>
            </Text>
          }
          name="contact"
        >
          <Input
            placeholder="Email atau nomor HP"
            size="large"
            style={{ borderRadius: 8, borderColor: "#e8d5c4" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Text strong style={{ color: "#3d2314" }}>
              Minuman Favorit{" "}
              <Text style={{ color: "#a07858", fontWeight: 400 }}>
                (opsional)
              </Text>
            </Text>
          }
          name="favorite_drink"
        >
          <Input
            placeholder="e.g. Caramel Cold Brew, Matcha Latte"
            size="large"
            style={{ borderRadius: 8, borderColor: "#e8d5c4" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <Text strong style={{ color: "#3d2314" }}>
              Interest Tags{" "}
              <Text style={{ color: "#a07858", fontWeight: 400 }}>
                (opsional)
              </Text>
            </Text>
          }
          name="tags"
        >
          <Select
            mode="tags"
            size="large"
            placeholder="Pilih atau ketik tag baru..."
            style={{ width: "100%", borderRadius: 8 }}
            options={SUGGESTED_TAGS.map((t) => ({ value: t, label: t }))}
            tokenSeparators={[","]}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            paddingTop: 8,
          }}
        >
          <Button
            onClick={onCancel}
            disabled={saving}
            style={{ borderRadius: 8, borderColor: "#e8d5c4" }}
          >
            Batal
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            loading={saving}
            style={{
              borderRadius: 8,
              background: "linear-gradient(135deg, #6f4e37, #a0522d)",
              border: "none",
              fontWeight: 700,
            }}
          >
            {saving ? "Menyimpan..." : customer ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </Form>
    </>
  );
}

// ─── Customer Card ─────────────────────────────────────────────────────────────
function CustomerCard({
  customer,
  onEdit,
  onDeleted,
}: {
  customer: Customer;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      messageApi.success("Customer dihapus");
      onDeleted();
    } catch (err: any) {
      messageApi.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const colors = [
    "#6f4e37",
    "#a0522d",
    "#7C9A6E",
    "#8B6E4E",
    "#C8873A",
    "#6B4423",
  ];
  const avatarColor = colors[customer.name.charCodeAt(0) % colors.length];

  return (
    <>
      {contextHolder}
      <Card
        style={{ borderRadius: 16, border: "1px solid #f0e6da" }}
        styles={{ body: { padding: 20 } }}
        hoverable
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Avatar
            size={44}
            style={{
              background: avatarColor,
              fontWeight: 700,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {customer.name.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{
                color: "#3d2314",
                fontSize: 15,
                display: "block",
                marginBottom: 2,
              }}
            >
              {customer.name}
            </Text>
            {customer.contact && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#a07858",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {customer.contact}
              </Text>
            )}
          </div>
        </div>

        {/* Favorite drink */}
        {customer.favorite_drink && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 14 }}>☕</span>
            <Text
              style={{ fontSize: 12, color: "#5a3a28", fontStyle: "italic" }}
            >
              {customer.favorite_drink}
            </Text>
          </div>
        )}

        {/* Tags */}
        {customer.tags && customer.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginBottom: 14,
            }}
          >
            {customer.tags.slice(0, 4).map((tag: string) => (
              <Tag
                key={tag}
                style={{
                  background: "#f5ede4",
                  color: "#6f4e37",
                  border: "1px solid #e8d5c4",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {tag}
              </Tag>
            ))}
            {customer.tags.length > 4 && (
              <Tag
                style={{
                  background: "#f0ebe8",
                  color: "#a07858",
                  border: "1px solid #e8d5c4",
                  borderRadius: 6,
                  fontSize: 11,
                  margin: 0,
                }}
              >
                +{customer.tags.length - 4}
              </Tag>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
            style={{
              flex: 1,
              borderRadius: 8,
              borderColor: "#e8d5c4",
              color: "#6f4e37",
              fontWeight: 600,
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            icon={<DeleteOutlined />}
            danger
            loading={deleting}
            onClick={() =>
              Modal.confirm({
                title: "Hapus Customer?",
                content: `Customer "${customer.name}" akan dihapus permanen.`,
                okText: "Hapus",
                okType: "danger",
                cancelText: "Batal",
                onOk: handleDelete,
                okButtonProps: { style: { borderRadius: 8 } },
                cancelButtonProps: { style: { borderRadius: 8 } },
              })
            }
            style={{ flex: 1, borderRadius: 8 }}
          >
            Hapus
          </Button>
        </div>
      </Card>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInterest, setSelectedInterest] = useState<string | undefined>(
    undefined,
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedInterest) params.set("interest", selectedInterest); // Tambahkan interest ke params

      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCustomers(json.data ?? []);
    } catch (err: any) {
      messageApi.error(err.message ?? "Gagal memuat customer");
    } finally {
      setLoading(false);
    }
  }, [search, selectedInterest, messageApi]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  return (
    <>
      {contextHolder}
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: 24 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <Title
              level={3}
              style={{ margin: 0, color: "#3d2314", fontWeight: 800 }}
            >
              Customers
            </Title>
            <Text style={{ color: "#a07858", fontSize: 13 }}>
              {customers.length} pelanggan ditemukan
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            style={{
              borderRadius: 10,
              background: "linear-gradient(135deg, #6f4e37, #a0522d)",
              border: "none",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(111,78,55,0.3)",
            }}
          >
            Tambah Customer
          </Button>
        </div>

        {/* Search */}
        {/* Search & Filter Container */}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#a07858" }} />}
            placeholder="Cari nama atau kontak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            style={{
              flex: 2,
              minWidth: 200,
              borderRadius: 10,
              borderColor: "#e8d5c4",
            }}
            allowClear
          />

          <Select
            size="large"
            placeholder="Filter by Interest"
            style={{ flex: 1, minWidth: 180 }}
            allowClear
            value={selectedInterest}
            onChange={(val) => setSelectedInterest(val)} // Update state saat dipilih
            options={SUGGESTED_TAGS.map((t) => ({ value: t, label: t }))}
            suffixIcon={<SearchOutlined style={{ color: "#a07858" }} />}
            styles={{
              root: {
                flex: 1,
                minWidth: 180,
                borderRadius: 10,
              },
            }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                style={{ borderRadius: 16, border: "1px solid #f0e6da" }}
                styles={{ body: { padding: 20 } }}
              >
                <Skeleton avatar active paragraph={{ rows: 3 }} />
              </Card>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <Card
            style={{
              borderRadius: 16,
              border: "1px solid #f0e6da",
              textAlign: "center",
            }}
            styles={{ body: { padding: "64px 24px" } }}
          >
            <div style={{ fontSize: 44, color: "#c8a882", marginBottom: 16 }}>
              <UserOutlined />
            </div>
            <Title level={4} style={{ color: "#3d2314", marginBottom: 8 }}>
              Belum ada customer
            </Title>
            <Text
              style={{ color: "#a07858", display: "block", marginBottom: 24 }}
            >
              Tambahkan customer pertama kamu
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              style={{
                borderRadius: 10,
                background: "linear-gradient(135deg, #6f4e37, #a0522d)",
                border: "none",
                fontWeight: 700,
              }}
            >
              Tambah Customer
            </Button>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {customers.map((c) => (
              <CustomerCard
                key={c.id}
                customer={c}
                onEdit={() => {
                  setEditing(c);
                  setShowForm(true);
                }}
                onDeleted={fetchCustomers}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          open={showForm}
          onCancel={() => setShowForm(false)}
          title={
            <Text strong style={{ color: "#3d2314", fontSize: 16 }}>
              {editing ? "Edit Customer" : "Tambah Customer"}
            </Text>
          }
          footer={null}
          width={500}
          destroyOnHidden
        >
          <CustomerForm
            customer={editing}
            onSaved={() => {
              setShowForm(false);
              fetchCustomers();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      </div>
    </>
  );
}
