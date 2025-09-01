import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../config/supabase';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #667eea;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
`;

const CodeCell = styled(Td)`
  font-family: monospace;
  font-weight: 600;
  color: #667eea;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  transition: background 0.3s ease;

  &.edit {
    background: #3498db;
    color: white;

    &:hover {
      background: #2980b9;
    }
  }

  &.delete {
    background: #e74c3c;
    color: white;

    &:hover {
      background: #c0392b;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h3`
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled(Button)`
  background: #95a5a6;
  
  &:hover {
    background: #7f8c8d;
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 600;

  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ name: '', hourly_rate: '' });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setMessage('직원 목록을 불러오는데 실패했습니다.');
        return;
      }

      setEmployees(employees || []);
    } catch (error) {
      setMessage('직원 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { data, error } = await supabase
        .from('employees')
        .insert([{ 
          code, 
          name: newEmployee.name, 
          hourly_rate: parseInt(newEmployee.hourly_rate) 
        }])
        .select()
        .single();

      if (error) {
        setMessage('직원 등록에 실패했습니다.');
        return;
      }

      setEmployees([data, ...employees]);
      setNewEmployee({ name: '', hourly_rate: '' });
      setMessage('직원이 성공적으로 등록되었습니다.');
    } catch (error) {
      setMessage('직원 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          name: editingEmployee.name, 
          hourly_rate: parseInt(editingEmployee.hourly_rate) 
        })
        .eq('code', editingEmployee.code);

      if (error) {
        setMessage('직원 정보 수정에 실패했습니다.');
        return;
      }
      
      setEmployees(employees.map(emp => 
        emp.code === editingEmployee.code ? editingEmployee : emp
      ));
      
      setShowEditModal(false);
      setEditingEmployee(null);
      setMessage('직원 정보가 수정되었습니다.');
    } catch (error) {
      setMessage('직원 정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (employee) => {
    setEditingEmployee({ ...employee });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditingEmployee({
      ...editingEmployee,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container>
      <Title>직원 관리</Title>

      {message && (
        <Message className={message.includes('실패') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      <Card>
        <h3>새 직원 등록</h3>
        <Form onSubmit={handleAddEmployee}>
          <InputGroup>
            <Label>직원 이름</Label>
            <Input
              type="text"
              name="name"
              value={newEmployee.name}
              onChange={handleInputChange}
              placeholder="직원 이름을 입력하세요"
              required
            />
          </InputGroup>
          <InputGroup>
            <Label>시급 (원)</Label>
            <Input
              type="number"
              name="hourly_rate"
              value={newEmployee.hourly_rate}
              onChange={handleInputChange}
              placeholder="시급을 입력하세요"
              min="0"
              step="10"
              required
            />
          </InputGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '등록 중...' : '직원 등록'}
          </Button>
        </Form>
      </Card>

      <Card>
        <h3>직원 목록</h3>
        <Table>
          <thead>
            <tr>
              <Th>직원 코드</Th>
              <Th>이름</Th>
              <Th>시급</Th>
              <Th>등록일</Th>
              <Th>작업</Th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.code}>
                <CodeCell>{employee.code}</CodeCell>
                <Td>{employee.name}</Td>
                <Td>{employee.hourly_rate?.toLocaleString()}원</Td>
                <Td>{new Date(employee.created_at).toLocaleDateString()}</Td>
                <Td>
                  <ActionButton 
                    className="edit"
                    onClick={() => openEditModal(employee)}
                  >
                    수정
                  </ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {showEditModal && (
        <Modal onClick={() => setShowEditModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>직원 정보 수정</ModalTitle>
            <ModalForm onSubmit={handleEditEmployee}>
              <InputGroup>
                <Label>직원 이름</Label>
                <Input
                  type="text"
                  name="name"
                  value={editingEmployee.name}
                  onChange={handleEditInputChange}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>시급 (원)</Label>
                <Input
                  type="number"
                  name="hourly_rate"
                  value={editingEmployee.hourly_rate}
                  onChange={handleEditInputChange}
                  min="0"
                  step="10"
                  required
                />
              </InputGroup>
              <ButtonGroup>
                <Button type="submit" disabled={loading}>
                  {loading ? '수정 중...' : '수정'}
                </Button>
                <CancelButton type="button" onClick={() => setShowEditModal(false)}>
                  취소
                </CancelButton>
              </ButtonGroup>
            </ModalForm>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default EmployeeManagement;
